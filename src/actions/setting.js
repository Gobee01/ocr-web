
  export const toggleLoader = (view) => {
    return {
      type: "TOGGLE_LOADER",
      payload: view
    };
  };

  export const toggleLoaderClear = (view) => {
    return {
      type: "TOGGLE_LOADER_CLEAR",
      payload: view
    };
  };
  
  export const toggleLoaderMulti = (view) => {
    return {
      type: "TOGGLE_LOADER_MULTI",
      payload: view
    };
  };
  