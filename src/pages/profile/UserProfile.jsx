import { useState } from "react";

/* ================= HEADER ================= */

const TopHeader = ({ preview, setPreview }) => {
  return (
    <div className="flex items-center justify-between px-10 py-6 border-b bg-white">
      <h1 className="text-2xl font-semibold">
        {preview ? "Preview Profile" : "Edit User Profile"}
        <button
          onClick={() => setPreview(!preview)}
          className="ml-3 text-sm text-indigo-600 hover:underline"
        >
          {preview ? "Edit ↩" : "Preview ↗"}
        </button>
      </h1>

      <div className="flex items-center gap-4 text-gray-500">
        🔔 💡 👤
      </div>
    </div>
  );
};

/* ================= PHOTO ================= */

const PhotoSection = ({
  preview,
  avatar,
  setAvatar,
}) => {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="h-[120px] rounded-lg bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-[-45px]" />

      <div className="relative flex items-center gap-5">
        <img
          src={avatar}
          alt=""
          className="h-[90px] w-[90px] rounded-full object-cover border-4 border-white"
        />

        <div>
          <p className="font-semibold text-lg">Your Photo</p>
          <p className="text-sm text-gray-500">
            This will be displayed on your profile
          </p>

          {!preview && (
            <div className="flex gap-3 mt-3">
              <label className="border px-4 py-2 rounded-lg text-sm cursor-pointer">
                Upload New
                <input
                  type="file"
                  hidden
                  onChange={handleUpload}
                />
              </label>

              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= FORM ================= */

const PersonalInfo = ({
  preview,
  form,
  setForm,
}) => {
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold">
        Personal information
      </h3>

      {[
        ["Full Name", "name"],
        ["Email address", "email"],
        ["Mobile number", "phone"],
        ["Role", "role"],
      ].map(([label, key]) => (
        <div key={key}>
          <p className="text-sm mb-1 text-gray-500">
            {label}
          </p>

          <input
            name={key}
            value={form[key]}
            disabled={preview}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
          />
        </div>
      ))}
    </div>
  );
};

/* ================= BIO ================= */

const BioCard = ({ preview, bio, setBio }) => (
  <div className="bg-white rounded-xl border p-6">
    <h3 className="font-semibold mb-3">Bio</h3>

    <textarea
      rows="5"
      disabled={preview}
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
    />
  </div>
);

/* ================= TAGS ================= */

const TagSection = ({
  preview,
  tags,
  setTags,
}) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (!newTag) return;
    setTags([...tags, newTag]);
    setNewTag("");
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-3">
        Industry / Interests
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            onClick={() =>
              !preview &&
              setTags(tags.filter((_, idx) => idx !== i))
            }
            className={`px-3 py-1 rounded-full text-xs ${
              preview
                ? "bg-gray-100 text-gray-400"
                : "bg-indigo-50 text-indigo-600 cursor-pointer"
            }`}
          >
            {tag} {!preview && "✕"}
          </span>
        ))}
      </div>

      {!preview && (
        <div className="flex gap-2 mt-4">
          <input
            value={newTag}
            onChange={(e) =>
              setNewTag(e.target.value)
            }
            placeholder="Add interest..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={addTag}
            className="border px-4 rounded-lg text-sm"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= SOCIAL ================= */

const SocialSection = ({
  preview,
  links,
  setLinks,
}) => {
  const addLink = () =>
    setLinks([...links, ""]);

  const updateLink = (i, val) => {
    const copy = [...links];
    copy[i] = val;
    setLinks(copy);
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-3">
        Social Media Accounts
      </h3>

      {links.map((link, i) => (
        <input
          key={i}
          disabled={preview}
          value={link}
          onChange={(e) =>
            updateLink(i, e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm disabled:bg-gray-50"
        />
      ))}

      {!preview && (
        <button
          onClick={addLink}
          className="w-full border rounded-lg py-2 text-sm"
        >
          + Add more
        </button>
      )}
    </div>
  );
};

/* ================= MAIN ================= */

const UserProfile = () => {
  const [preview, setPreview] = useState(false);

  const [avatar, setAvatar] = useState(
    "https://via.placeholder.com/150"
  );

  const [form, setForm] = useState({
    name: "Ayman Shaltoni",
    email: "ayman@gmail.com",
    phone: "+966 5502938123",
    role: "Senior Product Designer",
  });

  const [bio, setBio] = useState(
    "Hey, I'm a product designer specialized in UI..."
  );

  const [tags, setTags] = useState([
    "UI Design",
    "Framer",
    "Startups",
    "UX",
    "Crypto",
    "Mobile Apps",
  ]);

  const [links, setLinks] = useState([
    "https://twitter.com/shaltoni",
    "https://instagram.com/shaltoni",
    "https://linkedin.com/in/ayman",
  ]);

  const saveAll = () => {
    const payload = {
      avatar,
      form,
      bio,
      tags,
      links,
    };

    console.log("SAVE PROFILE:", payload);
    alert("Profile saved (demo)");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <TopHeader
        preview={preview}
        setPreview={setPreview}
      />

      <div className="p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="space-y-8 lg:col-span-2">
          <PhotoSection
            preview={preview}
            avatar={avatar}
            setAvatar={setAvatar}
          />

          <PersonalInfo
            preview={preview}
            form={form}
            setForm={setForm}
          />

          {!preview && (
            <div className="flex justify-end">
              <button
                onClick={saveAll}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm"
              >
                Save All Changes
              </button>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          <BioCard
            preview={preview}
            bio={bio}
            setBio={setBio}
          />

          <TagSection
            preview={preview}
            tags={tags}
            setTags={setTags}
          />

          <SocialSection
            preview={preview}
            links={links}
            setLinks={setLinks}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
