import { SubHeading } from "../../components/header/SubHeading";
import YellowButton from "../../components/button/buttonReg/yellowButton";
import FileUpload from "../../components/Modol/FileUpload";
import { useState } from "react";

const Media = () => {
  const [file, setfile] = useState(false);
  const heandalClick = () => {
    setfile(true);
  };
  const cancelHandel = () => {
    setfile(false);
  };
  const submitHandle = () => {
    console.log("submitHandle");
  };
  return (
    <div className="media-container">
      <div className="heading">
        <SubHeading title="Media">
          <YellowButton
            title="IMPORT MEDIA"
            padding="0.8rem 0.7rem"
            onClick={heandalClick}
          />
        </SubHeading>
      </div>
      <div className="media-body">
        {file && (
          <FileUpload cancelHandel={cancelHandel} submitHandle={submitHandle} />
        )}
      </div>
    </div>
  );
};

export default Media;
