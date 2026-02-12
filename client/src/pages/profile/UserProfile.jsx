import "./profile.scss";
const UserProfile = () => {
  const userName = "demo";
  const userEmail = "demo@example.com";
  const userPhone = 7401741074;
  const roles = "Team members";
  const profileData = [
    {
      title: "User Full Name : ",
      data: userName,
    },
    {
      title: "Email Address : ",
      data: userEmail,
    },
    {
      title: "Phone Number : ",
      data: userPhone,
    },
    {
      title: "Role : ",
      data: roles,
    },
  ];

  return (
    <div id="user-profile">
      <div className="col1 list">
        <p className="pi-heading">PERSONAL INFORMATION</p>
        {profileData.map((prop, index) => {
          return (
            <div className="pi-box" style={{ display: "flex" }} key={index}>
              <p className="pi-subheading">
                <b>{prop.title}</b>
              </p>
              <p className="pi-subheading" style={{ color: "green" }}>
                {prop.data}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserProfile;
