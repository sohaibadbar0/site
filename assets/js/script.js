const contractAddress = "0xda101c52a24106eb2407cb8da14f781b954dcc89";
const chain = "polygon";
const limit = 20;
const apiKey = "6384e86a1dbb4b6b9c50de7d30887b30"; // Your API Key

// --- Marketplace Logo URLs ---
// IMPORTANT: These are your local asset paths.
// Ensure these files (30.PNG, 28.PNG, 29.PNG) exist and are square in shape.
// If they are not square, they might still appear distorted even with CSS.
const openseaLogoUrl = "assets/images/30.PNG";
const raribleLogoUrl = "assets/images/28.PNG"; // Corrected from .PMG to .PNG
const magicEdenLogoUrl = "assets/images/29.PNG";

async function fetchNFTs() {
  const listUrl = `https://api.opensea.io/api/v2/chain/${chain}/contract/${contractAddress}/nfts?limit=${limit}`;
  const container = document.getElementById("nft-collection");
  const loadingMessage = document.getElementById("nft-loading-message");

  if (!container) {
    console.error("Error: NFT collection container not found. Make sure an element with id 'nft-collection' exists.");
    return;
  }

  container.innerHTML = ""; // Clear previous content
  if (loadingMessage) {
    loadingMessage.textContent = "Loading NFTs..."; // Show loading message
  }

  if (!apiKey || apiKey.includes("YOUR_OPENSEA_API_KEY_HERE")) {
    console.error("OpenSea API Key is not set or is a placeholder. Please replace 'YOUR_OPENSEA_API_KEY_HERE' with your actual API Key in script.js.");
    if (loadingMessage) {
      loadingMessage.textContent = "Error: OpenSea API Key is missing. Please set your API key in script.js.";
    }
    container.innerHTML = "<p>Error: OpenSea API Key is missing. Please check your `script.js`.</p>";
    return;
  }

  try {
    console.log("Fetching NFT list from:", listUrl);
    const listRes = await fetch(listUrl, { headers: { "X-API-KEY": apiKey } });

    if (!listRes.ok) {
      const errorText = await listRes.text();
      throw new Error(`OpenSea List API responded with status ${listRes.status}: ${errorText}`);
    }

    const listData = await listRes.json();
    console.log("OpenSea List API Response:", listData);

    if (!listData.nfts || listData.nfts.length === 0) {
      container.innerHTML = "<p>No NFTs found for this contract on OpenSea. Double-check contract address or chain.</p>";
      if (loadingMessage) {
        loadingMessage.textContent = "";
      }
      return;
    }

    for (const nft of listData.nfts) {
      const tokenId = nft.identifier;
      if (!tokenId) {
        console.warn("NFT in list response is missing 'identifier'. Skipping.", nft);
        continue;
      }
      console.log(`Attempting to fetch details for Token ID: ${tokenId}`);

      const detailUrl = `https://api.opensea.io/api/v2/chain/${chain}/contract/${contractAddress}/nfts/${tokenId}`;
      const detailRes = await fetch(detailUrl, { headers: { "X-API-KEY": apiKey } });

      if (!detailRes.ok) {
        const errorText = await detailRes.text();
        console.error(`Error fetching detail for Token ID ${tokenId}: Status ${detailRes.status}, Response: ${errorText}`);
        container.insertAdjacentHTML("beforeend", `
          <div class="nft-card">
            <div class="h-48 bg-gray-800 flex items-center justify-center text-center text-red-400">Error loading NFT ${tokenId}</div>
            <h3 class="mt-2 font-bold">Error NFT ${tokenId}</h3>
            <p>Could not load details.</p>
            <a href="https://opensea.io/assets/matic/${contractAddress}/${tokenId}" target="_blank">View on OpenSea</a>
          </div>`);
        continue;
      }

      const tokenData = await detailRes.json();
      const nftDetail = tokenData.nft;

      console.log("Fetched NFT details:", {
        tokenId,
        image: nftDetail?.image_url,
        name: nftDetail?.name,
        traits: nftDetail?.traits
      });

      if (!nftDetail) {
        console.warn(`Detail response for Token ID ${tokenId} is missing 'nft' object. Skipping.`);
        continue;
      }

      const image = nftDetail.image_url || null;
      const name = nftDetail.name || `Unnamed NFT #${tokenId}`;
      const traits = Array.isArray(nftDetail.traits) ? nftDetail.traits : [];

      const traitsHTML = traits.length
        ? `<ul class="list-disc list-inside text-sm text-gray-400 mt-2 px-4">${traits.map(t => `<li><strong>${t.trait_type}:</strong> ${t.value}</li>`).join("")}</ul>`
        : `<p class="text-gray-500 text-sm mt-2 px-4">No traits available.</p>`;

      const openseaLink = `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
      const raribleLink = `https://rarible.com/token/polygon/${contractAddress}:${tokenId}`;
      const magicEdenLink = `https://magiceden.io/token/polygon/${contractAddress}/${tokenId}`;

      const cardHTML = `
        <div class="nft-card" data-token-id="${tokenId}" data-contract-address="${contractAddress}">
          ${image ? `<img src="${image}" alt="${name}" class="w-full h-48 object-cover"/>` : `<div class="h-48 bg-gray-800 flex items-center justify-center">No image</div>`}
          <div class="p-4">
            <h3 class="mt-2 font-bold text-lg">${name}</h3>
            ${traitsHTML}
            <div class="mt-4 flex"> <a href="${openseaLink}" target="_blank" title="View on OpenSea">
                <img src="${openseaLogoUrl}" alt="OpenSea Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'10\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
              </a>
              <a href="${raribleLink}" target="_blank" title="View on Rarible">
                <img src="${raribleLogoUrl}" alt="Rarible Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'10\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
              </a>
              <a href="${magicEdenLink}" target="_blank" title="View on Magic Eden">
                <img src="${magicEdenLogoUrl}" alt="Magic Eden Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'10\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
              </a>
            </div>
          </div>
        </div>`;

      container.insertAdjacentHTML("beforeend", cardHTML);
    }
    if (loadingMessage) {
      loadingMessage.textContent = "";
    }
  } catch (e) {
    console.error("Fetch error:", e);
    if (loadingMessage) {
      loadingMessage.textContent = "Error fetching NFTs. See console for details.";
    }
    container.innerHTML = "<p class='text-red-500'>Error fetching NFTs. Please check your internet connection, API key, and browser console.</p>";
  }
}

// --- Modal Functionality (START) ---
const nftModal = document.getElementById("nft-modal");
const modalCloseButton = document.getElementById("modal-close-button");
const modalNftImage = document.getElementById("modal-nft-image");
const modalNftTitle = document.getElementById("modal-nft-title");
const modalNftDescription = document.getElementById("modal-nft-description");
const modalNftPrice = document.getElementById("modal-nft-price");
const modalNftTraits = document.getElementById("modal-nft-traits");
const modalBuyButton = document.getElementById("modal-buy-button");
const modalMarketplaceLogos = document.querySelector(".modal-content .marketplace-logos");

async function openNftModal(tokenId, contractAddress) {
  // Clear previous content
  modalNftTraits.innerHTML = "";
  modalMarketplaceLogos.innerHTML = ""; // Clear existing marketplace logos in modal

  // Ensure all modal elements are found before attempting to populate
  if (!nftModal || !modalCloseButton || !modalNftImage || !modalNftTitle || !modalNftDescription || !modalNftPrice || !modalNftTraits || !modalBuyButton || !modalMarketplaceLogos) {
    console.error("One or more modal elements not found. Check IDs in HTML.");
    return;
  }

  const detailUrl = `https://api.opensea.io/api/v2/chain/${chain}/contract/${contractAddress}/nfts/${tokenId}`;

  try {
    console.log(`Fetching modal details for Token ID: ${tokenId}`);
    const detailRes = await fetch(detailUrl, { headers: { "X-API-KEY": apiKey } });

    if (!detailRes.ok) {
        const errorText = await detailRes.text();
        throw new Error(`OpenSea Detail API for modal responded with status ${detailRes.status}: ${errorText}`);
    }

    const tokenData = await detailRes.json();
    const nftDetail = tokenData.nft; // OpenSea API wraps details in 'nft' object

    console.log("NFT Detail data for modal:", nftDetail); // Log the fetched data for debugging

    if (!nftDetail) {
      console.error(`Could not fetch 'nft' object from detail response for modal: Token ID ${tokenId}`);
      // Fallback for modal content if data is missing
      modalNftImage.src = "https://placehold.co/400x400/333/fff?text=No+Data";
      modalNftTitle.textContent = "Error Loading NFT";
      modalNftDescription.textContent = "Could not retrieve full NFT details.";
      modalNftPrice.textContent = "";
      modalNftTraits.innerHTML = "<p class='col-span-full text-red-400'>Error loading traits.</p>";
      modalBuyButton.href = "#"; // Disable or set a default link
      nftModal.classList.add("show");
      return;
    }

    modalNftImage.src = nftDetail.image_url || "https://placehold.co/400x400/333/fff?text=No+Image";
    modalNftTitle.textContent = nftDetail.name || `Unnamed NFT #${tokenId}`;
    modalNftDescription.textContent = nftDetail.description || "No description available.";

    // Price is not directly available in this API response, would need another API for listings
    modalNftPrice.textContent = "Price: Not Available (Requires Listing API)";

    // Populate traits
    const traits = Array.isArray(nftDetail.traits) ? nftDetail.traits : [];
    if (traits.length > 0) {
      traits.forEach(t => {
        const traitItem = document.createElement("div");
        traitItem.classList.add("modal-trait-item");
        traitItem.innerHTML = `<strong>${t.trait_type}:</strong> ${t.value}`;
        modalNftTraits.appendChild(traitItem);
      });
    } else {
      modalNftTraits.innerHTML = "<p class='col-span-full text-gray-400'>No traits available.</p>";
    }

    // Populate marketplace logos in modal
    const openseaLink = `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
    const raribleLink = `https://rarible.com/token/polygon/${contractAddress}:${tokenId}`;
    const magicEdenLink = `https://magiceden.io/token/polygon/${contractAddress}/${tokenId}`;

    modalMarketplaceLogos.insertAdjacentHTML("beforeend", `
      <a href="${openseaLink}" target="_blank" title="View on OpenSea">
        <img src="${openseaLogoUrl}" alt="OpenSea Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
      </a>
      <a href="${raribleLink}" target="_blank" title="View on Rarible">
        <img src="${raribleLogoUrl}" alt="Rarible Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
      </a>
      <a href="${magicEdenLink}" target="_blank" title="View on Magic Eden">
        <img src="${magicEdenLogoUrl}" alt="Magic Eden Logo" class="marketplace-logo" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23FF0000\'/%3E%3Ctext x=\'50%\' y=\'50%\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%23FFFFFF\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EERR%3C/text%3E%3C/svg%3E';"/>
      </a>
    `);

    // Set Buy Now link (default to OpenSea)
    modalBuyButton.href = openseaLink;

    nftModal.classList.add("show");
  } catch (error) {
    console.error("Error opening modal or fetching modal data:", error);
    // Show a general error message in the modal if an error occurs during fetch
    modalNftImage.src = "https://placehold.co/400x400/333/fff?text=Error";
    modalNftTitle.textContent = "Error Loading NFT";
    modalNftDescription.textContent = "An error occurred while loading NFT details. Check console.";
    modalNftPrice.textContent = "";
    modalNftTraits.innerHTML = "";
    modalMarketplaceLogos.innerHTML = "";
    modalBuyButton.href = "#";
    nftModal.classList.add("show");
  }
}

// Close modal event
modalCloseButton.addEventListener("click", () => {
  nftModal.classList.remove("show");
});

// Close modal when clicking outside content
nftModal.addEventListener("click", (e) => {
  if (e.target === nftModal) {
    nftModal.classList.remove("show");
  }
});

// Event listener for NFT cards to open modal (using event delegation)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nft-collection").addEventListener("click", (event) => {
    const nftCard = event.target.closest(".nft-card");
    if (nftCard) {
      const tokenId = nftCard.dataset.tokenId;
      const contractAddress = nftCard.dataset.contractAddress;
      if (tokenId && contractAddress) {
        openNftModal(tokenId, contractAddress);
      }
    }
  });
});

window.onload = fetchNFTs;