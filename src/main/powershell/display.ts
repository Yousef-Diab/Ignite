import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { Resolution } from '@shared/types'

const execFileAsync = promisify(execFile)

// All DEVMODE handling is done inside C# methods to avoid PowerShell
// boxing/unboxing issues with value-type structs passed via [ref].
// IntPtr.Zero is used for device name (= primary display) so $null
// marshaling from PowerShell is never a concern.
const ADD_TYPE_BLOCK = `
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential, CharSet=CharSet.Auto)]
public struct DEVMODE {
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=32)] public string dmDeviceName;
    public ushort dmSpecVersion;
    public ushort dmDriverVersion;
    public ushort dmSize;
    public ushort dmDriverExtra;
    public uint   dmFields;
    public int    dmPositionX;
    public int    dmPositionY;
    public uint   dmDisplayOrientation;
    public uint   dmDisplayFixedOutput;
    public short  dmColor;
    public short  dmDuplex;
    public short  dmYResolution;
    public short  dmTTOption;
    public short  dmCollate;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst=32)] public string dmFormName;
    public ushort dmLogPixels;
    public uint   dmBitsPerPel;
    public uint   dmPelsWidth;
    public uint   dmPelsHeight;
    public uint   dmDisplayFlags;
    public uint   dmDisplayFrequency;
    public uint   dmICMMethod;
    public uint   dmICMIntent;
    public uint   dmMediaType;
    public uint   dmDitherType;
    public uint   dmReserved1;
    public uint   dmReserved2;
    public uint   dmPanningWidth;
    public uint   dmPanningHeight;
}

public static class WinDisplay {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    private static extern bool EnumDisplaySettings(IntPtr device, int modeNum, ref DEVMODE dm);

    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    private static extern int ChangeDisplaySettingsEx(IntPtr device, ref DEVMODE dm, IntPtr hwnd, uint flags, IntPtr param);

    private static DEVMODE NewDm() {
        DEVMODE dm = new DEVMODE();
        dm.dmSize = (ushort)Marshal.SizeOf(typeof(DEVMODE));
        return dm;
    }

    public static string GetCurrent() {
        DEVMODE dm = NewDm();
        EnumDisplaySettings(IntPtr.Zero, -1, ref dm);
        return dm.dmPelsWidth + " " + dm.dmPelsHeight + " " + dm.dmDisplayFrequency;
    }

    public static string[] ListModes() {
        var results = new List<string>();
        var seen = new HashSet<string>();
        for (int i = 0; ; i++) {
            DEVMODE dm = NewDm();
            if (!EnumDisplaySettings(IntPtr.Zero, i, ref dm)) break;
            string key = dm.dmPelsWidth + "x" + dm.dmPelsHeight + "@" + dm.dmDisplayFrequency;
            if (seen.Add(key))
                results.Add(dm.dmPelsWidth + " " + dm.dmPelsHeight + " " + dm.dmDisplayFrequency);
        }
        return results.ToArray();
    }

    public static int SetRes(int w, int h, int hz) {
        DEVMODE dm = NewDm();
        EnumDisplaySettings(IntPtr.Zero, -1, ref dm);
        dm.dmFields         = 0x580000u;
        dm.dmPelsWidth      = (uint)w;
        dm.dmPelsHeight     = (uint)h;
        dm.dmDisplayFrequency = (uint)hz;
        return ChangeDisplaySettingsEx(IntPtr.Zero, ref dm, IntPtr.Zero, 1u, IntPtr.Zero);
    }
}
'@ -ErrorAction Stop
`

const GET_RESOLUTION_SCRIPT = `
${ADD_TYPE_BLOCK}
Write-Output ([WinDisplay]::GetCurrent())
`

const LIST_MODES_SCRIPT = `
${ADD_TYPE_BLOCK}
[WinDisplay]::ListModes() | Write-Output
`

function buildSetResolutionScript(w: number, h: number, hz: number): string {
  return `
${ADD_TYPE_BLOCK}
Write-Output ([WinDisplay]::SetRes(${w}, ${h}, ${hz}))
`
}

async function runPS(script: string): Promise<string> {
  const encoded = Buffer.from(script, 'utf16le').toString('base64')
  const { stdout, stderr } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
    { windowsHide: true, timeout: 15000 }
  )
  if (stderr?.trim()) {
    console.error('[powershell]', stderr.trim())
  }
  return stdout.trim()
}

export async function getCurrentResolution(): Promise<Resolution> {
  const out = await runPS(GET_RESOLUTION_SCRIPT)
  const parts = out.split(/\s+/).map(Number)
  return { width: parts[0], height: parts[1], refreshRate: parts[2] }
}

export async function setResolution(width: number, height: number, refreshRate: number): Promise<void> {
  const script = buildSetResolutionScript(width, height, refreshRate)
  const out = await runPS(script)
  const code = parseInt(out, 10)
  if (code !== 0 && code !== 1) {
    throw new Error(`ChangeDisplaySettingsEx failed with code ${code}`)
  }
}

export async function listDisplayModes(): Promise<Resolution[]> {
  const out = await runPS(LIST_MODES_SCRIPT)
  if (!out) return []

  const modes = out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.trim().split(/\s+/).map(Number)
      return { width: parts[0], height: parts[1], refreshRate: parts[2] }
    })
    .filter((m) => m.width > 0 && m.height > 0 && m.refreshRate > 0)

  modes.sort((a, b) => {
    if (b.width !== a.width) return b.width - a.width
    if (b.height !== a.height) return b.height - a.height
    return b.refreshRate - a.refreshRate
  })

  return modes
}
