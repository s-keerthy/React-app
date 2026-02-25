import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ServiceTracking.css';

const ServiceTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSn = searchParams.get('serialnumber') || '';

  const [serialNumber, setSerialNumber] = useState(initialSn);
  const [warrantyData, setWarrantyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialSn) {
      fetchWarrantyData(initialSn);
    }
  }, [initialSn]);

const fetchWarrantyData = async (sn) => {
  setLoading(true);
  setError(null);
  setWarrantyData(null);

  try {
    const snClean = sn.trim();

    // --- PASTE YOUR CLOUD FLOW HTTP URL HERE ---
    const cloudFlowUrl = 'https://931009ff5cfae9318e79fd03a7aec5.02.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/25c48de2c1cc48da98d5c1b4dd11b177/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PT0-UFdDyvcJycOR8pVeE78vj_VaSvaIm61e8wc2Nl4';
    
    const response = await fetch(cloudFlowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serialnumber: snClean
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warranty data');
    }

    const data = await response.json();

    if (data.cr19f_serialnumber) {
      setWarrantyData(data);
    } else {
      throw new Error('No warranty record found');
    }
    
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ serialnumber: serialNumber });
    fetchWarrantyData(serialNumber);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h2>Welcome To view the Warranty Details</h2>
            <p>Enter your serial number to view warranty details</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-wrapper">
          
          {/* Left Column: Search Form */}
          <div className="card search-card">
            <h3 className="card-title">
              <span className="card-icon">🔍</span>
              Find Warranty
            </h3>

            <form onSubmit={handleSearch} className="service-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <span className="input-icon">🔢</span>
                  <input 
                    type="text" 
                    name="serialnumber" 
                    placeholder="Enter Product Serial Number" 
                    className="form-input" 
                    value={serialNumber} 
                    onChange={(e) => setSerialNumber(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                <span>Search</span>
                <span>→</span>
              </button>
            </form>

            <div className="help-section">
              <h4>📞 Need Help?</h4>
              <p>
                If you can't find your serial number, please contact our support team at
                <strong> support@example.com</strong>
              </p>
            </div>
          </div>

          {/* Right Column: Warranty Details */}
          <div className="details-section">
            
            {loading && <div className="loading-spinner">Loading...</div>}

            {!loading && warrantyData && (
              <div className="warranty-details-section">
                <h5 className="warranty-details-title">
                  <span className="title-icon">📋</span>
                  Warranty Details
                </h5>

                <div className="warranty-grid">
                  <WarrantyField 
                    icon="👤" 
                    label="Name:" 
                    value={warrantyData.cr19f_customername || "N/A"} 
                  />
                  <WarrantyField 
                    icon="📧" 
                    label="Email:" 
                    value={warrantyData.cr19f_emailid || "N/A"} 
                  />
                  <WarrantyField 
                    icon="📱" 
                    label="Mobile:" 
                    value={warrantyData.cr19f_mobilenumber || "N/A"}
                  />
                  <WarrantyField 
                    icon="📦" 
                    label="Product:" 
                    value={warrantyData.cr19f_productname || "N/A"} 
                  />
                  <WarrantyField 
                    icon="🔢" 
                    label="Serial Number:" 
                    value={warrantyData.cr19f_serialnumber || "N/A"} 
                  />
                  {/* <WarrantyField 
                    icon="🏷️" 
                    label="Brand:" 
                    value={warrantyData.cr19f_brand || "N/A"} 
                  />
                  <WarrantyField 
                    icon="📅" 
                    label="Purchase Date:" 
                    value={formatDate(warrantyData.cr19f_dateofpurchase)} 
                  />
                  <WarrantyField 
                    icon="📆" 
                    label="Warranty End:" 
                    value={formatDate(warrantyData.cr19f_warrantyenddate)}  
                  /> */}
                  <WarrantyField 
                    icon="🏷️" 
                    label="Address:" 
                    value={warrantyData.cr19f_address || "N/A"} 
                  />
                  <WarrantyField 
                        icon="🧾" 
                        label="Invoice:" 
                        value={
                            warrantyData && warrantyData.cr19f_invoice 
                            ? (
                                <a 
                                href={warrantyData.cr19f_invoice} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="invoice-link"
                                >
                                View Invoice
                                </a>
                            )
                            : "Not Available"
                        } 
                        />  
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="error-card">
                <div className="error-icon">❌</div>
                <p className="error-message">No warranty record found</p>
                <p className="error-detail">Serial Number: "{serialNumber}"</p>
                <p style={{ marginTop: '20px', color: '#6C757D' }}>Please check your serial number and try again.</p>
              </div>
            )}

            {!loading && !warrantyData && !error && !initialSn && (
              <div className="card empty-state">
                <div style={{ fontSize: '5rem', marginBottom: '0px', opacity: 0.3 }}>🔍</div>
                <h3>Ready to Search</h3>
                <p>Enter your serial number to view warranty details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Warranty Fields
const WarrantyField = ({ icon, label, value }) => (
  <div className="warranty-field">
    <span className="field-icon">{icon}</span>
    <div className="field-content">
      <div className="field-label">{label}</div>
      <div className="field-value">{value}</div>
    </div>
  </div>
);

export default ServiceTracking;