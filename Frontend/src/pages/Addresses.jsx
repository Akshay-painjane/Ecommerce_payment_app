import { useEffect, useMemo, useState } from "react";
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

const getStorageKey = (user) => `style_store_addresses_${user?.id || user?.email || "guest"}`;

const getUserAddresses = (user) => {
  const raw = user?.addresses || user?.address;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === "object") {
    return [raw];
  }

  return [];
};

const normalizeAddress = (address, index = 0) => ({
  id: address?.id || address?.address_id || `address-${Date.now()}-${index}`,
  fullName: address?.fullName || address?.full_name || address?.name || "",
  mobile: address?.mobile || address?.phone || address?.phone_number || "",
  pincode: address?.pincode || address?.pin_code || address?.zip || "",
  house: address?.house || address?.house_number || address?.address_line1 || "",
  area: address?.area || address?.street || address?.address_line2 || "",
  landmark: address?.landmark || "",
  city: address?.city || "",
  state: address?.state || "",
  isDefault: Boolean(address?.isDefault || address?.is_default || index === 0),
});

const loadAddresses = (user) => {
  try {
    const stored = localStorage.getItem(getStorageKey(user));
    const saved = stored ? JSON.parse(stored) : [];
    const source = saved.length ? saved : getUserAddresses(user);
    return source.map(normalizeAddress);
  } catch {
    return getUserAddresses(user).map(normalizeAddress);
  }
};

function Addresses() {
  const initialUser = auth.getUser();
  const [user, setUser] = useState(initialUser);
  const [addresses, setAddresses] = useState(() => loadAddresses(initialUser));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const storageKey = useMemo(() => getStorageKey(user), [user]);

  useEffect(() => {
    let active = true;

    api.me()
      .then((data) => {
        if (active) {
          setUser(data);
          setAddresses((current) => (current.length ? current : loadAddresses(data)));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (addresses.length) {
      localStorage.setItem(storageKey, JSON.stringify(addresses));
    }
  }, [addresses, storageKey]);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const openNewForm = () => {
    setEditingId("");
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const editAddress = (address) => {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      mobile: address.mobile,
      pincode: address.pincode,
      house: address.house,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
    });
    setError("");
    setShowForm(true);
  };

  const saveAddress = (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName || !form.mobile || !form.pincode || !form.house || !form.area || !form.city || !form.state) {
      setError("Please complete all required address fields.");
      return;
    }

    const nextAddress = {
      ...form,
      id: editingId || `address-${Date.now()}`,
      isDefault: editingId ? addresses.find((address) => address.id === editingId)?.isDefault : addresses.length === 0,
    };

    setAddresses((current) => {
      if (editingId) {
        return current.map((address) => (address.id === editingId ? nextAddress : address));
      }

      return [...current, nextAddress];
    });
    setShowForm(false);
    setEditingId("");
    setForm(emptyForm);
  };

  const removeAddress = (id) => {
    setAddresses((current) => {
      const remaining = current.filter((address) => address.id !== id);

      if (remaining.length && !remaining.some((address) => address.isDefault)) {
        return remaining.map((address, index) => ({ ...address, isDefault: index === 0 }));
      }

      if (!remaining.length) {
        localStorage.removeItem(storageKey);
      }

      return remaining;
    });
  };

  const setDefault = (id) => {
    setAddresses((current) => current.map((address) => ({ ...address, isDefault: address.id === id })));
  };

  return (
    <section className="account-subpage page-section">
      <nav className="account-breadcrumb" aria-label="Breadcrumb">
        <Link to="/account">Your account</Link>
        <span>&gt;</span>
        <span>Your Addresses</span>
      </nav>

      <div className="account-subpage-heading">
        <div>
          <h1>Your Addresses</h1>
          <p>Save delivery locations for faster checkout across Style Store.</p>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <div className="address-grid">
        <button className="add-address-card" onClick={openNewForm} type="button">
          <span className="add-address-icon" aria-hidden="true">+</span>
          <strong>Add Address</strong>
          <small>Add a new delivery location</small>
        </button>

        {addresses.map((address) => (
          <article className="address-card" key={address.id}>
            <div className="address-card-top">
              <strong>{address.fullName || user?.name || "Style Store Customer"}</strong>
              {address.isDefault && <span>Default address</span>}
            </div>
            <p>{address.mobile || user?.phone || "Mobile number not provided"}</p>
            <p>{address.house}</p>
            <p>{address.area}{address.landmark ? `, ${address.landmark}` : ""}</p>
            <p>{[address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>
            <div className="address-actions">
              <button onClick={() => editAddress(address)} type="button">Edit</button>
              <button onClick={() => removeAddress(address.id)} type="button">Remove</button>
              <button disabled={address.isDefault} onClick={() => setDefault(address.id)} type="button">
                Set as default
              </button>
            </div>
          </article>
        ))}
      </div>

      {!addresses.length && (
        <div className="address-empty-state">
          <span aria-hidden="true">+</span>
          <h2>No saved addresses yet</h2>
          <p>Add your home, office, or gift address and choose it quickly during checkout.</p>
          <button onClick={openNewForm} type="button">Add your first address</button>
        </div>
      )}

      {showForm && (
        <div className="address-modal-backdrop" role="presentation">
          <form className="address-modal" onSubmit={saveAddress}>
            <div className="address-modal-header">
              <h2>{editingId ? "Edit Address" : "Add Address"}</h2>
              <button onClick={() => setShowForm(false)} type="button" aria-label="Close">x</button>
            </div>

            <div className="address-form-grid">
              <label>Full name<input name="fullName" value={form.fullName} onChange={updateForm} required /></label>
              <label>Mobile number<input name="mobile" value={form.mobile} onChange={updateForm} type="tel" required /></label>
              <label>Pincode<input name="pincode" value={form.pincode} onChange={updateForm} required /></label>
              <label>House number<input name="house" value={form.house} onChange={updateForm} required /></label>
              <label>Area / Street<input name="area" value={form.area} onChange={updateForm} required /></label>
              <label>Landmark<input name="landmark" value={form.landmark} onChange={updateForm} /></label>
              <label>City<input name="city" value={form.city} onChange={updateForm} required /></label>
              <label>State<input name="state" value={form.state} onChange={updateForm} required /></label>
            </div>

            <div className="address-form-actions">
              <button type="submit">Save Address</button>
              <button className="outline-button" onClick={() => setShowForm(false)} type="button">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Addresses;
