import { getShoppingList, setItemCompleted, deleteItem } from '@/actions/shoppingList';
import { useState, useEffect } from 'react';

export const ShoppingList = () => {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getShoppingList();
        setList(data);
        setLoading(false);
        console.log(data)
      } catch (error) {
        console.error('Error fetching shopping list items:', error);
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) {
    return <p>Loading Items...</p>
  }

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function handleItemChecked(id: number, e: React.ChangeEvent<HTMLInputElement>) {
    const completed = e.target.checked;

    setList((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
        item.id === id
            ? { ...item, completed }
            : item
        ),
    }));

    await setItemCompleted(id, e.target.checked)

    await sleep(1500); // wait 2 seconds
    if (e.target.checked) {
        await deleteItem(id);

        setList((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        }));
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{list.name}</h1>

      <div className="space-y-2">
        {list.items.map((listItem) => (
          <label
            key={listItem.id}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={listItem.completed}
                onChange={(e) => handleItemChecked(listItem.id, e)}
                className="h-5 w-5"
              />

              <span
                className={
                  listItem.completed
                    ? "line-through text-muted-foreground"
                    : ""
                }
              >
                {listItem.customName ?? listItem.item.name}
              </span>
            </div>

            <span className="text-sm text-muted-foreground">
              {listItem.quantity}
              {listItem.unit ? ` ${listItem.unit}` : ""}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
  }