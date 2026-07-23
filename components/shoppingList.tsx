import { getShoppingList } from '@/actions/shoppingList';
import { useState, useEffect } from 'react';

export const ShoppingList = () => {
    const [loading, setLoading] = useState(true);
    const [listItems, setListItems] = useState([]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getShoppingList();
        setListItems(data);
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

  return (
    <p>it worked</p>
  );
  }