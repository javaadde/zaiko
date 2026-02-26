// ========================
// API Configuration
// ========================

// Change this to your server's IP/URL when testing on a real device
// For Android emulator: http://10.0.2.2:5000
// For iOS simulator: http://localhost:5000
// For real device on same WiFi: http://<your-local-ip>:5000
import { Platform } from "react-native";

const getBaseUrl = () => {
  // Production URL
  const PROD_URL = "https://takeone-stocks.onrender.com/api";

  // Use the IP address shown in your Metro terminal for local testing
  const LOCAL_IP = "192.168.43.160";

  if (__DEV__) {
    // If you are on an emulator/simulator, localhost/10.0.2.2 still works
    // but using the local IP works for BOTH physical devices and emulators
    // Set this to PROD_URL if you want to test the live server during development
    return `http://${LOCAL_IP}:5000/api`;
  }

  return PROD_URL;
};

export const API_BASE_URL = getBaseUrl();

// ========================
// API Helper
// ========================

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    if (error.message === "Network request failed") {
      throw new Error(
        "Cannot connect to server. Make sure the backend is running.",
      );
    }
    throw error;
  }
};

// ========================
// Inventory API
// ========================

export const inventoryAPI = {
  /**
   * Get all inventory items with optional filters
   */
  getAll: async (params = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const endpoint = queryString ? `/inventory?${queryString}` : "/inventory";
    return apiRequest(endpoint);
  },

  /**
   * Get single item by ID
   */
  getById: async (id) => {
    return apiRequest(`/inventory/${id}`);
  },

  /**
   * Create a new item (with optional image file)
   */
  create: async (itemData, imageUri) => {
    const formData = new FormData();

    // Add all text fields
    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // Add image if provided
    if (imageUri) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    const url = `${API_BASE_URL}/inventory`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type header — fetch will set it with the boundary
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create item");
    }
    return data;
  },

  /**
   * Update an item (with optional new image)
   */
  update: async (id, itemData, imageUri) => {
    const formData = new FormData();

    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    if (imageUri) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    const url = `${API_BASE_URL}/inventory/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update item");
    }
    return data;
  },

  /**
   * Delete an item
   */
  delete: async (id) => {
    return apiRequest(`/inventory/${id}`, { method: "DELETE" });
  },

  /**
   * Search items
   */
  search: async (query) => {
    return apiRequest(`/inventory/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get dashboard stats
   */
  getStats: async () => {
    return apiRequest("/inventory/stats");
  },

  /**
   * Process a sale
   */
  sell: async (id, saleData, imageUri) => {
    const formData = new FormData();

    // Add all text fields
    Object.entries(saleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // Add customer photo
    if (imageUri) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("customerPhoto", {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    const url = `${API_BASE_URL}/inventory/${id}/sell`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to process sale");
    }
    return data;
  },

  /**
   * Process a restock
   */
  restock: async (id, quantityToAdd) => {
    return apiRequest(`/inventory/${id}/restock`, {
      method: "POST",
      body: JSON.stringify({ quantityToAdd }),
    });
  },
  /**
   * Archive an item
   */
  archive: async (id) => {
    return apiRequest(`/inventory/${id}/archive`, { method: "PATCH" });
  },
  /**
   * Unarchive an item
   */
  unarchive: async (id) => {
    return apiRequest(`/inventory/${id}/unarchive`, { method: "PATCH" });
  },
};

// ========================
// Upload API
// ========================

export const uploadAPI = {
  /**
   * Upload a standalone image (for camera/gallery capture)
   */
  uploadImage: async (imageUri) => {
    const formData = new FormData();

    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    });

    const url = `${API_BASE_URL}/upload/image`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload image");
    }
    return data;
  },

  /**
   * Delete an uploaded image
   */
  deleteImage: async (publicId) => {
    return apiRequest(`/upload/image/${publicId}`, { method: "DELETE" });
  },
};

// ========================
// Sales API
// ========================

export const salesAPI = {
  /**
   * Get all sales history with searching and sorting
   */
  getAll: async (params = {}) => {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const endpoint = queryString ? `/sales?${queryString}` : "/sales";
    return apiRequest(endpoint);
  },
};
