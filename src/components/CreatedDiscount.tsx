export function CreateDiscount() {
    return (
        <div className="create-discount">
            <h2>Create Discount</h2>
            <form>
                <label>
                    Discount
                    <input type="number" name="discountAmount" required />
                </label>
                <select name="unit" id="unit">
                    <option value="%">%</option>
                    <option value="$">$</option>
                </select>
            </form>
        </div>
    );
}