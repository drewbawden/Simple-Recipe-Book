import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  disabled: boolean;
  text: string;
  disabledText: string;
}
export const SubmitButton = ({
  disabled,
  text,
  disabledText,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="disabled:bg-gray-400 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition"
    >
      {pending ? disabledText : text}
    </button>
  );
};
