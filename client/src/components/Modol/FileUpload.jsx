import { useDropzone } from "react-dropzone";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { IconButton } from "@mui/material";
import YellowButton from "../button/buttonReg/yellowButton";
import "./fileupload.scss";
import { useRef } from "react";
import { useMemo } from "react";
import filieIcon from "../../assets/file-icon.png";

const FileUpload = ({ cancelHandel, submitHandle }) => {
  const modelRef = useRef();
  const closeModel = (e) => {
    if (modelRef.current == e.target) {
      cancelHandel();
    }
  };

  //input file design
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({ accept: { "image/*": [] } });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div ref={modelRef} className="main-container" onClick={closeModel}>
      <div className="input-card">
        <div className="top">
          <div className="heading">
            <p>Upload and attach files</p>
            <p id="subHeading">Upload and attach files to this project.</p>
          </div>
          <IconButton onClick={cancelHandel}>
            <HighlightOffIcon />
          </IconButton>
        </div>
        <div className="input">
          <div className="container">
            <div {...getRootProps({ style })}>
              <img src={filieIcon} alt="icon" />
              <input {...getInputProps()} />
              <p>
                Drag &lsquo;n&lsquo; drop some files here, or click to select
                files
              </p>
            </div>
          </div>
        </div>
        <div className="button">
          <YellowButton
            title="Cancel"
            padding="0.6rem 2rem"
            darkYellow="#faf9f7"
            simpleBorder="1px solid #423d335b"
            onClick={cancelHandel}
          />
          <YellowButton
            title="Submit"
            padding="0.6rem 2rem"
            onClick={submitHandle}
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  padding: "3rem",
  borderWidth: 2,
  borderRadius: 8,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};
