Accounts.ui.config({
  requestPermissions: {},
  extraSignupFields: [{
    fieldName: 'first-name',
    fieldLabel: 'First name',
    inputType: 'text',
    visible: true,
    validate: function(value, errorFunction) {
      if (!value) {
        errorFunction("Please write your first name");
        return false;
      } else {
        return true;
      }
    }
  }, {
    fieldName: 'last-name',
    fieldLabel: 'Last name',
    inputType: 'text',
    visible: true,
  }, {
    fieldName: 'gender',
    showFieldLabel: false,
    fieldLabel: 'Gender',
    inputType: 'radio',
    radioLayout: 'vertical',
    data: [{
      id: 1,
      label: 'Male',
      value: 'm'
    }, {
      id: 2,
      label: 'Female',
      value: 'f',
      checked: 'checked'
    }],
    visible: true
  }, {
    fieldName: 'country',
    fieldLabel: 'Country',
    inputType: 'select',
    showFieldLabel: true,
    empty: 'Please select your country of residence',
    data: [{
      id: 1,
      label: 'USA',
      value: 'us'
    }, {
      id: 2,
      label: 'Taiwan',
      value: 'tw'
    }],
    visible: true
  }]
});
