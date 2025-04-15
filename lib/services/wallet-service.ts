// lib/services/wallet-service.ts
import { ethers } from "ethers";
import {
  getWalletState,
  connectWallet as mockConnectWallet,
  disconnectWallet as mockDisconnectWallet,
  checkAdminStatus as mockCheckAdminStatus,
  submitAdminApplication as mockSubmitAdminApplication,
  type WalletState,
  type AdminApplication,
} from "@/lib/mock/wallet";

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const USE_MOCK = false;

// 获取钱包状态
export async function getWalletStatus(): Promise<WalletState> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getWalletState());
      }, 200);
    });
  }

  if (typeof window.ethereum === "undefined") {
    return {
      isConnected: false,
      isAdmin: false,
      address: null,
    };
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    const signer = accounts.length > 0 ? accounts[0] : null;
    const address = signer ? await signer.getAddress() : null;
    const isAdmin = address ? await checkAdminStatus(address) : false;

    return {
      isConnected: !!address,
      isAdmin,
      address,
    };
  } catch (error) {
    console.error("Failed to get wallet status:", error);
    return {
      isConnected: false,
      isAdmin: false,
      address: null,
    };
  }
}

// 连接钱包
export async function connectWallet(walletType: string): Promise<WalletState> {
  if (USE_MOCK) {
    return mockConnectWallet(walletType);
  }

  if (typeof window.ethereum === "undefined") {
    throw new Error("No Ethereum provider found.");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    if (signer) {
      const address = await signer.getAddress(); // 获取地址
      const isAdmin = await checkAdminStatus(address); // 使用获取的地址

      return {
        isConnected: true,
        isAdmin,
        address,
      };
    } else {
      return {
        isConnected: false,
        isAdmin: false,
        address: null,
      };
    }
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return {
      isConnected: false,
      isAdmin: false,
      address: null,
    };
  }
}

// 断开钱包连接
export async function disconnectWallet(): Promise<WalletState> {
  if (USE_MOCK) {
    return mockDisconnectWallet();
  }

  return {
    isConnected: false,
    isAdmin: false,
    address: null,
  };
}

// 检查管理员状态
export async function checkAdminStatus(address: string): Promise<boolean> {
  if (USE_MOCK) {
    return mockCheckAdminStatus(address);
  }

  // 在实际应用中，这里会检查链上管理员状态
  // 示例：假设管理员地址存储在合约中
  // const contract = new ethers.Contract(contractAddress, contractABI, provider);
  // return contract.isAdmin(address);

  return true; // 替换为实际的管理员检查逻辑
}

// 提交管理员申请
export async function submitAdminApplication(application: AdminApplication): Promise<boolean> {
  if (USE_MOCK) {
    return mockSubmitAdminApplication(application);
  }

  // 在实际应用中，这里会提交到链上或API
  // 示例：假设管理员申请通过合约提交
  // const contract = new ethers.Contract(contractAddress, contractABI, signer);
  // await contract.applyForAdmin(application.reason);
  return true; // 替换为实际的管理员申请逻辑
}