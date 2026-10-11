import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, FormField, Input, Select, AlertBanner } from '../ui';

export const AddAddressForm = ({ onCancel, onSaved }) => {
  const { isHindi } = useLanguage();
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!street.trim() || !city.trim()) {
      setError(isHindi ? 'कृपया सड़क व शहर का नाम दर्ज करें।' : 'Please enter street and city.');
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      label,
      street: street.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
    };

    onSaved(newAddr);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <FormField label={isHindi ? 'पते का प्रकार' : 'Address Label'}>
        <Select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          options={[
            { value: 'Home', label: isHindi ? 'घर (Home)' : 'Home' },
            { value: 'Work', label: isHindi ? 'ऑफिस / दुकान (Work)' : 'Work' },
            { value: 'Other', label: isHindi ? 'अन्य (Other)' : 'Other' },
          ]}
        />
      </FormField>

      <FormField label={isHindi ? 'सड़क / मकान नंबर / क्षेत्र *' : 'Street / House / Area *'} required={true}>
        <Input
          required
          placeholder={isHindi ? 'मकान नं, गली, मोहल्ला' : 'House No., Street, Landmark'}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField label={isHindi ? 'शहर / कस्बा *' : 'City / Town *'} required={true}>
          <Input
            required
            placeholder={isHindi ? 'शहर' : 'City'}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </FormField>

        <FormField label={isHindi ? 'पिनकोड' : 'Pincode'}>
          <Input
            placeholder="846001"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label={isHindi ? 'संपर्क फ़ोन नंबर' : 'Contact Phone'}>
        <Input
          type="tel"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </FormField>

      {error && <AlertBanner type="error" message={error} />}

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
          {isHindi ? 'रद्द करें' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" style={{ flex: 1 }}>
          {isHindi ? 'पता सुरक्षित करें' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};
export default AddAddressForm;
