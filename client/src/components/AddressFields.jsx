import { getBarangaysByMunicipalityName, getMunicipalityByName, MUNICIPALITIES } from '../data/municipalityData';

export default function AddressFields({ values, onChange, errors = {}, required = true }) {
  const barangays = getBarangaysByMunicipalityName(values.municipality);
  const selectedMunicipality = getMunicipalityByName(values.municipality);
  const hasCustomMunicipality = values.municipality && !selectedMunicipality;
  const hasCustomBarangay = values.barangay && !barangays.some((barangay) => barangay.name === values.barangay);
  const marker = required ? ' *' : '';

  const updateAddress = (updates) => onChange(updates);

  const handleMunicipalityChange = (event) => {
    const municipality = getMunicipalityByName(event.target.value);

    updateAddress({
      municipality: event.target.value,
      city: municipality?.name || '',
      barangay: '',
      postalCode: municipality?.zipCode || ''
    });
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="address-municipality">Municipality{marker}</label>
        <select
          id="address-municipality"
          className={`input ${errors.municipality ? 'input-error' : ''}`}
          name="municipality"
          value={values.municipality || ''}
          onChange={handleMunicipalityChange}
          required={required}
        >
          <option value="">Select municipality</option>
          {hasCustomMunicipality && <option value={values.municipality}>{values.municipality}</option>}
          {MUNICIPALITIES.map((municipality) => (
            <option key={municipality.id} value={municipality.name}>{municipality.name}</option>
          ))}
        </select>
        {errors.municipality && <span className="error-text">{errors.municipality}</span>}
      </div>
      <div className="input-group">
        <label htmlFor="address-barangay">Barangay{marker}</label>
        <select
          id="address-barangay"
          className={`input ${errors.barangay ? 'input-error' : ''}`}
          name="barangay"
          value={values.barangay || ''}
          onChange={(event) => updateAddress({ barangay: event.target.value })}
          required={required}
          disabled={!values.municipality}
        >
          <option value="">{values.municipality ? 'Select barangay' : 'Select municipality first'}</option>
          {hasCustomBarangay && <option value={values.barangay}>{values.barangay}</option>}
          {barangays.map((barangay) => (
            <option key={barangay.id} value={barangay.name}>{barangay.name}</option>
          ))}
        </select>
        {errors.barangay && <span className="error-text">{errors.barangay}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="address-street">Street + House No.{marker}</label>
        <input
          id="address-street"
          className={`input ${errors.street ? 'input-error' : ''}`}
          name="street"
          value={values.street || ''}
          onChange={(event) => updateAddress({ street: event.target.value })}
          required={required}
        />
        {errors.street && <span className="error-text">{errors.street}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="address-postal-code">Postal Code{marker}</label>
        <input
          id="address-postal-code"
          className={`input ${errors.postalCode ? 'input-error' : ''}`}
          name="postalCode"
          value={values.postalCode || ''}
          onChange={(event) => updateAddress({ postalCode: event.target.value })}
          required={required}
        />
        {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
      </div>
    </>
  );
}
