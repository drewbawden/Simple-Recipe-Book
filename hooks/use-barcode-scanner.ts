import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const applyZoom = async (stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const caps = track.getCapabilities() as any;

    if (caps?.zoom) {
      const maxZoom = caps.zoom.max || 2;
      try {
        await track.applyConstraints({
          advanced: [{ zoom: Math.min(maxZoom, 2.5) }] as any,
        });
      } catch (err) {
        console.warn("Failed to apply zoom:", err);
      }
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    const reader = new BrowserMultiFormatReader();

    const start = async () => {
      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          videoRef.current!,
          (result) => {
            if (result) {
              onScan(result.getText());
              setIsScanning(false);
              controls.stop();
            }
          }
        );

        controlsRef.current = controls;

        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          await applyZoom(stream);
        }

      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    start();

    return () => {
      controlsRef.current?.stop();
    };
  }, [isScanning, onScan]);

  return {
    videoRef,
    isScanning,
    rescan: () => {
      setIsScanning(true);
    }
  };
}
