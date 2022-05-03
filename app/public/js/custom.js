sf.display.ImageDrum = function() {
  return [
    ' ',
    'SWA',
    'AAL',
    'BAW',
    'DAL',
    'UAE',
    'KLM',
    'DLH',
    'ASA',
    'UAL',
    'FDX',
    'PXM',
    'SKW',
    'JBU',
    'ACA',
    'QXE',
    'NKS',
    'VIR',
    'LXJ',
    'QFA'
  ];
};

sf.plugins.generalInfo  = {
  dataType: 'json',

  url: function(options) {
    return 'temp/general-info';
  },

  formatData: function(response) {
    return response.data;
  }
};

sf.plugins.personalStatistics  = {
  dataType: 'json',

  url: function(options) {
    return 'temp/personal-statistics';
  },

  formatData: function(response) {
    return response.data;
  }
};

sf.plugins.arrivals = {
  dataType: 'json',

  url: function(options) {
    return 'temp/test';
  },

  formatData: function(response) {
    return response.data;
  }
};
