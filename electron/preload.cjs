const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printReceipt: (data) => {
    // Stubbed for now - will connect to real printer in phase 2
    console.log("Print receipt stub called with:", data);
    return Promise.resolve({ success: true, stub: true });
  },
});
