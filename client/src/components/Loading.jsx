import LodingLogo from "../assets/logo.svg";

const Loading = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <img src={LodingLogo} alt="logo" />
      <p>Lodding...</p>
    </div>
  );
};

export default Loading;
