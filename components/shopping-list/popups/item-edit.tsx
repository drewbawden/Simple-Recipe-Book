export const ItemEditPopup = () => {
  return (
    <form className="text-gray-900">
      <div className="border-1 border-gray-200 rounded">
        <input type="text" placeholder="Name" className="block" />
        <input type="text" placeholder="Notes" className="block" />
        <input type="text" placeholder="URL" className="block" />
      </div>
      <div>
        <h2>List select</h2>
      </div>
      <div>
        <h2>Category select</h2>
      </div>
      <div>
        <p>flagged (priority) boolean</p>
      </div>
    </form>
  );
};
