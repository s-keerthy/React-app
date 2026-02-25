import React, { useState, useRef } from 'react';
import './FormComponent.css';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    product: '',
    serialnumber: '', // Added serial number
    file: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, success: false, message: '' });

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let payload = {
      CustomerName: formData.name.trim(),
      EmailID: formData.email.trim(),
      MobileNumber: formData.phone.trim(),
      Address: formData.address.trim(),
      ProductName: formData.product.trim(),
      SerialNumber: formData.serialnumber.trim(), // Added serial number
    };

    if (formData.file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        payload.FileName = formData.file.name;
        payload.File = base64String;

        console.log("Submitting payload:", { eventData: JSON.stringify(payload) });
        await sendToFlow(payload);
      };
      reader.readAsDataURL(formData.file);
    } else {
      console.log("Submitting payload (no file):", { eventData: JSON.stringify(payload) });
      await sendToFlow(payload);
    }
  };

  const sendToFlow = async (payload) => {
    try {
      const response = await fetch('https://931009ff5cfae9318e79fd03a7aec5.02.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/84ff8be9620e43758d7e7f09b3387e1d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5T1ij8KQmqAWlYUyxcbo96BTTdsOYlqDxLdoK-ejULo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventData: JSON.stringify(payload) }),
      });

      if (response.ok) {
        const responseText = await response.text();
        let result = null;
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Response is not valid JSON:', responseText);
            setModal({ show: true, success: true, message: responseText || 'Product registered successfully!' });
            resetForm();
            return;
          }
        }
        const message = result?.Response || 'Product registered successfully!';
        setModal({ show: true, success: true, message });
        resetForm();
      } else {
        const errorText = await response.text();
        console.error('Flow error response:', errorText);
        throw new Error(`Flow failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setModal({ show: true, success: false, message: 'Failed to register product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', product: '', serialnumber: '', file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => setModal({ ...modal, show: false });

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-sidebar">
          <h2>Product Registration</h2>
          <p>Register your product to activate warranty and get support.</p>
        </div>
        <div className="form-section">
          <h3>Register Your Product</h3>
          <p>Please fill in all required fields.</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-field">
              <label>Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
            </div>
            <div className="form-field">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="hello@example.com" required />
            </div>
            <div className="form-field">
              <label>Phone <span className="required">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" required />
            </div>
            <div className="form-field">
              <label>Address <span className="required">*</span></label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your address" required />
            </div>
            <div className="form-field">
              <label>Product <span className="required">*</span></label>
              <input type="text" name="product" value={formData.product} onChange={handleInputChange} placeholder="Enter product name" required />
            </div>
            <div className="form-field">
              <label>Serial Number <span className="required">*</span></label>
              <input type="text" name="serialnumber" value={formData.serialnumber} onChange={handleInputChange} placeholder="Enter serial number" required />
            </div>
            <div className="form-field full-width">
              <label>Upload Invoice</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={isLoading} className="submit-button">
              <span className={isLoading ? 'hidden' : ''}>Register Product</span>
              {isLoading && <span className="spinner"></span>}
            </button>
          </form>
        </div>
      </div>

      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className={`modal-icon ${modal.success ? 'success' : 'error'}`}>
              {modal.success ? '✓' : '✕'}
            </div>
            <h2>{modal.success ? 'Success!' : 'Error'}</h2>
            <p>{modal.message}</p>
            <button onClick={closeModal} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormComponent;