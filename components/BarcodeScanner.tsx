import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

interface Props {
  onResult: (barcode: string) => void;
}

export function BarcodeScanner({ onResult }: Props) {
  const { videoRef, isScanning, rescan } = useBarcodeScanner(onResult);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      {isScanning ? (
        <video ref={videoRef} className="w-full max-w-lg" playsInline />
      ) : (
        <button onClick={rescan} className="p-4 bg-blue-500 text-white">
          Scan New Item
        </button>
      )}
    </div>
  );
}
