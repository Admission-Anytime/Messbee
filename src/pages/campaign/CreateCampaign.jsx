import MainSidebar from "../../components/mainsidebar/MainSidebar";

const CreateCampaign = () => {
  return (
    <div className="main" style={{ display: "flex", width: "100%" }}>
      <MainSidebar />
      <div className="body">
        <form onSubmit={() => console.log("submit")}>
          <label>
            Campaign name
            <input type="text" name="name" placeholder="Name" required />
            <label htmlFor="cars">Select template</label>
            <select id="cars" name="cars">
              <option value="Select Template">Select Template</option>
            </select>
          </label>
          <br />
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
