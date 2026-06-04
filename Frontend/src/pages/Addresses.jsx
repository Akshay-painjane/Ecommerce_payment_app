import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, auth } from "../services/api.js";

const emptyForm = {
  fullName: "",
  mobile: "",
  pincode: "",
  house: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
};

const parseAddress = (user) => {
  if (!user?.address) {
    return {
      ...emptyForm,
      fullName: user?.name || "",
      mobile: user?.phone || "",
    };
  }

  const [addressPart, pincode = ""] = user.address.split(" - ");
  const parts = addressPart.split(",").map((part) => part.trim());

  return {
    fullName: user?.name || "",
    mobile: user?.phone || "",
    house: parts[0] || "",
    area: parts[1] || "",
    landmark: parts[2] || "",
    city: parts[3] || "",
    state: parts[4] || "",
    pincode,
  };
};

function Addresses() {
  const initialUser = auth.getUser();

  const [user, setUser] = useState(initialUser);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(parseAddress(initialUser));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .user()
      .then((data) => {
        if (!active) return;

        setUser(data);
        setForm(parseAddress(data));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const updateForm = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const openForm = () => {
    setForm(parseAddress(user));
    setError("");
    setShowForm(true);
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.fullName ||
      !form.mobile ||
      !form.pincode ||
      !form.house ||
      !form.area ||
      !form.city ||
      !form.state
    ) {
      setError("Please complete all required address fields.");
      return;
    }

    try {
      const addressString = [
        form.house,
        form.area,
        form.landmark,
        form.city,
        form.state,
      ]
        .filter(Boolean)
        .join(", ")
        .concat(` - ${form.pincode}`);

      const formData = new FormData();

      formData.append("name", form.fullName);
      formData.append("phone", form.mobile);
      formData.append("address", addressString);

      const updatedUser = await api.userUpdate(formData);

      setUser(updatedUser);
      setForm(parseAddress(updatedUser));
      setShowForm(false);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to save address."
      );
    }
  };

  return (
    <section className="account-subpage page-section">
      <nav className="account-breadcrumb" aria-label="Breadcrumb">
        <Link to="/account">Your account</Link>
        <span>&gt;</span>
        <span>Your Address</span>
      </nav>

      <div className="account-subpage-heading">
        <div>
          <h1>Your Address</h1>
          <p>Save your delivery location for faster checkout across Style Store.</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <div className="address-grid">
        {!user?.address && (
          <button
            className="add-address-card"
            onClick={openForm}
            type="button"
          >
            <span className="add-address-icon" aria-hidden="true">
              +
            </span>
            <strong>Add Address</strong>
            <small>Add your delivery location</small>
          </button>
        )}

        {user?.address && (
          <article className="address-card">
            <div className="address-card-top">
              <strong>{user?.name || "Style Store Customer"}</strong>
            </div>

            <p>{user?.phone || "Mobile number not provided"}</p>
            <p>{user.address}</p>

            <div className="address-actions">
              <button onClick={openForm} type="button">
                Edit
              </button>
            </div>
          </article>
        )}
      </div>

      {!user?.address && (
        <div className="address-empty-state">
          <span aria-hidden="true">+</span>
          <h2>No address saved yet</h2>
          <p>
            Add your home or office address and use it quickly during checkout.
          </p>
          <button onClick={openForm} type="button">
            Add Address
          </button>
        </div>
      )}

      {showForm && (
        <div className="address-modal-backdrop" role="presentation">
          <form className="address-modal" onSubmit={saveAddress}>
            <div className="address-modal-header">
              <h2>{user?.address ? "Edit Address" : "Add Address"}</h2>

              <button
                onClick={() => setShowForm(false)}
                type="button"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="address-form-grid">
              <label>
                Full name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={updateForm}
                  required
                />
              </label>

              <label>
                Mobile number
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={updateForm}
                  type="tel"
                  required
                />
              </label>

              <label>
                Pincode
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={updateForm}
                  required
                />
              </label>

              <label>
                House number
                <input
                  name="house"
                  value={form.house}
                  onChange={updateForm}
                  required
                />
              </label>

              <label>
                Area / Street
                <input
                  name="area"
                  value={form.area}
                  onChange={updateForm}
                  required
                />
              </label>

              <label>
                Landmark
                <input
                  name="landmark"
                  value={form.landmark}
                  onChange={updateForm}
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={updateForm}
                  required
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={updateForm}
                  required
                />
              </label>
            </div>

            <div className="address-form-actions">
              <button type="submit">Save Address</button>

              <button
                className="outline-button"
                onClick={() => setShowForm(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Addresses;