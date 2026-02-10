import { useState } from "react";
import SyncIcon from "../../assets/sync.svg";
import EditIcon from "../../assets/Edit.svg";

const BusinessProfile = () => {
  const date = new Date();
  const wabaId = 123456;

  // sync animation state
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <div
      className="rounded-[14px] border border-[#cfcfcf] bg-white flex justify-between w-[97%] ml-[18px] mt-[18px] px-[36px] py-[32px]"
    >
      {/* ================= LEFT ================= */}
      <div className="flex gap-4 w-[36%]">
        
        {/* Avatar */}
        <div className="h-[105px] w-[105px] rounded-full bg-blue-700 mt-1 flex items-center justify-center text-white text-[42px] font-semibold">
          A
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-[14px]">
            <div>
              <h2 className="text-[20px] font-semibold">
                Admission Anytime
              </h2>
              <p className="text-[14px]">
                +912345678900
              </p>
            </div>

            <img
              src={EditIcon}
              alt="edit-icon"
              className="h-4 w-4 cursor-pointer mt-1"
              onClick={() => console.log("helloworld")}
            />
          </div>

          {/* Last Sync */}
          <div className="flex items-center gap-3 text-[13px] text-gray-600 mb-[18px]">
            {`Last synced at ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`}

            <img
              src={SyncIcon}
              alt="icon"
              className={`h-4 w-4 cursor-pointer transition-all ${
                isSyncing ? "animate-spin" : ""
              }`}
              onClick={() => {
                console.log("helloworld");
                setIsSyncing(true);
                setTimeout(() => setIsSyncing(false), 2000);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-24">
            <div>
              <p className="font-semibold text-[14px] mb-[2px]">
                WABA ID
              </p>
              <p className="text-[14px]">{wabaId}</p>
            </div>

            <div>
              <p className="font-semibold text-[14px] mb-[2px]">
                Created On
              </p>
              <p className="text-[14px]">
                {date.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PERSONAL ================= */}
      <div className="w-[30%] px-10">
        <p className="font-medium mb-[12px] text-[var(--clr-subheading,#666)]">
          PERSONAL INFORMATION
        </p>

        <div className="space-y-[8px] text-[14px]">
          <div className="flex items-center justify-between gap-8">
            <span>Message limit tier :</span>
            <span className="text-green-600">1k</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Quality score :</span>
            <span className="text-green-600">Green</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Code Verification Status :</span>
            <span className="text-green-600">Verified</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Phone :</span>
            <span className="text-green-600">Connect</span>
          </div>
        </div>
      </div>

      {/* ================= WABA ================= */}
      <div className="w-[30%] px-10">
        <p className="font-medium mb-[12px] text-[var(--clr-subheading,#666)]">
          WABA INFO
        </p>

        <div className="space-y-[8px] text-[14px]">
          <div className="flex items-center justify-between gap-8">
            <span>Name: Admission Anytime</span>
            <span className="text-green-600">Approved</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Business verification :</span>
            <span className="text-green-600">Verified</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Payment method :</span>
            <span className="text-green-600">Verified</span>
          </div>

          <div className="flex items-center justify-between gap-8">
            <span>Id : 128104917063617</span>
            <span className="text-green-600">Connect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
