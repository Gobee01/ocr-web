export function convertLowerCase(value) {
    if (!value) return "";
    return value.toString().toLowerCase();
  }
  
  export function formatDisplayEnumValue(value) {
    if (!value) return "";
    return value
        .toString()
        .toLowerCase()
        .split('_')
        .map(word => toCapsFirst(word))
        .join(' ');
}

export function toCapsFirst(name) {
  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLocaleLowerCase();
  } else {
    return "";
  }
}

export const extractFilePath = (fullPath) => {
  const startIndex = fullPath.indexOf("uploaded-files/");
  if (startIndex !== -1) {
    return fullPath.substring(startIndex);
  }
  return fullPath;
};

export function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);

  const options = {
      month: 'short', // "Jun"
      day: 'numeric', // "5"
      year: 'numeric', // "2024"
      hour: 'numeric', // "6"
      minute: 'numeric', // "16"
      hour12: true // "PM"
  };

  return date.toLocaleString('en-US', options);
}