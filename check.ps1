Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('d:\0_projektek\honlap_dev\signup\MonoTypist_logo_dark.png')
Write-Output "0,0: R=$($bmp.GetPixel(0,0).R) G=$($bmp.GetPixel(0,0).G) B=$($bmp.GetPixel(0,0).B)"
Write-Output "10,10: R=$($bmp.GetPixel(10,10).R) G=$($bmp.GetPixel(10,10).G) B=$($bmp.GetPixel(10,10).B)"
$bmp.Dispose()
