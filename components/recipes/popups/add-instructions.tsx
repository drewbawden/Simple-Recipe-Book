import { useState } from "react";
import {
  Trash2,
  Plus,
  CornerDownRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { RecipeInstructionInput } from "@/types/recipe";

interface AddInstructionsPopupProps {
  instructionList: RecipeInstructionInput[];
  setInstructionList: React.Dispatch<
    React.SetStateAction<RecipeInstructionInput[]>
  >;
}

export const AddInstructionsPopup = ({
  instructionList,
  setInstructionList,
}: AddInstructionsPopupProps) => {
  const [newMethod, setNewMethod] = useState("");
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [insertText, setInsertText] = useState("");

  const reindexSteps = (
    list: { method: string }[],
  ): RecipeInstructionInput[] => {
    return list.map((item, idx) => ({
      stepNumber: idx + 1,
      method: item.method,
    }));
  };

  const handleAddEnd = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newMethod.trim()) return;

    const updated = [
      ...instructionList,
      { stepNumber: instructionList.length + 1, method: newMethod.trim() },
    ];
    setInstructionList(reindexSteps(updated));
    setNewMethod("");
  };

  const handleInsertAt = (targetIndex: number) => {
    if (!insertText.trim()) return;

    const updated = [...instructionList];
    updated.splice(targetIndex, 0, {
      stepNumber: targetIndex + 1,
      method: insertText.trim(),
    });

    setInstructionList(reindexSteps(updated));
    setInsertIndex(null);
    setInsertText("");
  };

  const handleRemove = (index: number) => {
    const updated = instructionList.filter((_, i) => i !== index);
    setInstructionList(reindexSteps(updated));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= instructionList.length) return;

    const updated = [...instructionList];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    setInstructionList(reindexSteps(updated));
  };

  return (
    <div className="text-gray-900">
      <form
        onSubmit={handleAddEnd}
        className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
      >
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="instruction"
            className="text-sm font-semibold text-gray-700"
          >
            Instruction
          </label>

          <textarea
            id="instruction"
            required
            rows={5}
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            placeholder="Describe this step..."
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!newMethod.trim()}
          className="flex flex-row w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition shadow-sm text-center block sm:inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </button>
      </form>

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-1">
        Current Instructions ({instructionList.length})
      </h3>

      {instructionList.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">No instructions</p>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {instructionList.map((item, index) => (
            <div key={index} className="group">
              <div className="flex flex-col gap-3 px-4 py-3 hover:bg-gray-100 transition sm:flex-row sm:items-start">
                <span className="flex items-center justify-center min-w-7 h-7 px-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md border border-gray-200">
                  {item.stepNumber}
                </span>

                <span className="flex-1 font-medium text-gray-900 text-sm leading-relaxed pt-1">
                  {item.method}
                </span>

                <div className="flex flex-wrap justify-between items-center gap-1 shrink-0">
                  <div className="flex border border-gray-200 rounded-md overflow-hidden bg-gray-100">
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === instructionList.length - 1}
                      className="p-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:hover:bg-transparent border-l border-gray-200 transition"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 hover:bg-red-100 active:bg-red-200 rounded-sm bg-gray-100 border border-gray-200 text-gray-700 hover:text-red-600 transition"
                    title="Delete instruction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {insertIndex !== index + 1 ? (
                <div className="relative z-10 flex items-center justify-center px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInsertIndex(index + 1);
                      setInsertText("");
                    }}
                    className="opacity-100 w-full sm:w-auto px-3 py-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold rounded-md hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Insert step here
                  </button>
                </div>
              ) : (
                <div className="mx-4 my-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Inserting Step #{index + 2}
                  </div>

                  <textarea
                    autoFocus
                    rows={3}
                    value={insertText}
                    onChange={(e) => setInsertText(e.target.value)}
                    placeholder="Describe this step..."
                    className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInsertIndex(null);
                        setInsertText("");
                      }}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 rounded-lg transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsertAt(index + 1)}
                      disabled={!insertText.trim()}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-lg transition shadow-sm"
                    >
                      Insert Step
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
