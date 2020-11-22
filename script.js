// Unsplash API
const IMAGE_COUNT = 12;
const SCROLL_DEBOUNCE_DELAY = 800;
const SEARCH_DEBOUNCE_DELAY = 400;
let initLoad = false;
const apiKey = 'VWp7hyL--HiYN5tQ5ksVywgLdRhciy2tnJS48fpT-c0';
const mainApi = `https://api.unsplash.com/photos`
const apiStaticUrl = `${mainApi}/random?client_id=${apiKey}&count=`;
let apiUrl = `${apiStaticUrl}${IMAGE_COUNT}`;
const imageContainer = document.getElementById('image-container');
const noData = document.getElementById('no-data');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-icon');
const removeBtn = document.getElementById('remove-icon');
let col1 = document.getElementById('col-1');
let col2 = document.createElement('div');
col2.id = 'col-2';
let col3 = document.createElement('div');
col3.id = 'col-3';
const loader = document.getElementById('loader');

let fetchedImagesPainted = false; // flag to indicate when all images are painted in the DOM
let numberOfImagesLoaded = 0; // counter when matched with imagesArray length, changes the fetchedImagesPainted flag
let imagesArray = [];
let gridsPresent = 1;
let searchQuery;

/**
 * Get the Api Url
 * @param {*} imagesCount no of images to be fetched
 */
const getAPIUrl = (imagesCount) => {
  return `${apiStaticUrl}${imagesCount}`;
}

/**
 * Hide loading UI
 */
const showLoading = () => {
  loader.hidden = false;
}

/**
 * Hide loading UI
 */
const hideLoading = () => {
  loader.hidden = true;
}

/**
 * Set attributes for a given element
 * @param {*} element HTML Element
 * @param {*} attributes Element attributes as key-value pairs in an object
 */
const setAttributes = (element, attributes) => {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

/**
 * Event listener for load of images
 */
const imageLoaded = () => {
  numberOfImagesLoaded += 1;
  if (numberOfImagesLoaded === IMAGE_COUNT) {
    fetchedImagesPainted = true;
    hideLoading();
  }
}

/**
 * Get photos from Unsplash API
 */
async function fetchImages() {
  try {
    if (!noData.hidden) {
      noData.hidden = true;
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    imagesArray.push(...data);
    numberOfImagesLoaded = 0;
    iterateOverNewPhotos(data);
  } catch (error) {
    // Catch error here
    console.error(error);
    // If there are no results or if API errors out
    noData.hidden = false;
  } finally {
    hideLoading();
  }
}

/**
 * Add an overlay over the image in the parent 
 * figure container. It contains the like-unlike button too
 * @param {*} figure The target container containing the image
 * @param {*} photo The photo data
 */
const renderOverlayInPhoto = (figure, photo) => {
  const overlayDiv = document.createElement("overlay");
  overlayDiv.classList.add('overlay');
  const likeBtn = document.createElement('img');
  likeBtn.classList.add('like-icon');
  setAttributes(likeBtn, {
    src: "assets/pics/like-icon.svg",
    alt: "Like Icon",
    id: photo.id
  });
  likeBtn.addEventListener('click', () => {
    // Documentation unclear, does not work
    // Error - OuAth token is not valid
    // const response = await fetch(`${mainApi}/${photo.id}/like?client_id=${apiKey}`, {
    //   method: "post"
    // });
    // const data = await response.json();
    if (photo.liked_by_user) {
      photo.liked_by_user = false;
      likeBtn.src = "assets/pics/like-icon.svg";
    } else {
      photo.liked_by_user = true;
      likeBtn.src = "assets/pics/like-filled-icon.svg";
    }
  });

  overlayDiv.appendChild(likeBtn);
  figure.appendChild(overlayDiv);

}

/**
 * Render photos in the UI by creating elements in the DOM
 */
const renderPhotoInUI = (photo) => {
  // Create figure - wrapper over image
  const figure = document.createElement("figure");
  // Create image
  const image = document.createElement("img");
  image.classList.add('image');
  setAttributes(image, {
    src: photo.urls.regular,
    alt: photo.alt_description || 'N/A',
    ...(photo.description && { title: photo.description }),
    loading: "lazy"
  });
  // add image load event listener
  image.addEventListener('load', imageLoaded);
  // Insert image inside <figure>
  figure.appendChild(image);
  renderOverlayInPhoto(figure, photo);
  return figure;  
}

/**
 * Function to iterate over the newly received images
 * and draw them in the columns
 * @param {any} imagesList 
 */
const iterateOverNewPhotos = (imagesList) => {
  let i = 0;
  while (i < imagesList.length) {
    col1.appendChild(renderPhotoInUI(imagesList[i]));
    i++;

    /**
     * This way of splitting can be used if the array of images 
     * consist of arbitrary number of elements, but we know there would be multiples of 3
     * so we can go ahead with a cleaner way
    */
    // if (!imagesList[i]) {
    //   break;
    // } else if (gridsPresent > 2) {
    //   col2.appendChild(renderPhotoInUI(imagesList[i]));
    //   i++;
    // }

    // if (!imagesList[i]) {
    //   break;
    // } else if (gridsPresent > 3) {
    //   col3.appendChild(renderPhotoInUI(imagesList[i]));
    //   i++;
    // }

   if (gridsPresent > 1) {
      col2.appendChild(renderPhotoInUI(imagesList[i]));
      i++;
    }

   if (gridsPresent > 2) {
      col3.appendChild(renderPhotoInUI(imagesList[i]));
      i++;
    }
  }

}

const debouncedFunction = function(callback, delayTime) {
  let timeOut;
  return function() {
    let context = this, args = arguments;
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      callback.apply(context, args)
    }, delayTime)
  }
}

const scrollerCallback = () => {
  if (fetchedImagesPainted && window.scrollY + window.innerHeight >= document.body.offsetHeight - 1000) {
    fetchedImagesPainted = false;
    fetchImages();
  }
}

/**
 * Dynamically add columns and manipuate the grid
 * columns layout based on window viewport width
 */
const createInnerDivs = () => {
  const windowWidth = window.innerWidth;
  if (windowWidth >= 700 && windowWidth <= 1200) {
    imageContainer.appendChild(col2);
    imageContainer.style.gridTemplateColumns ="repeat(2,1fr)";
    gridsPresent = 2;
  } else if (windowWidth > 1200) {
    imageContainer.appendChild(col2);
    imageContainer.appendChild(col3);
    imageContainer.style.gridTemplateColumns ="repeat(3,1fr)";
    gridsPresent = 3;
  }
}

/**
 * Based on the window width, manipulate the grid layout
 * and distribute the images between all columns
 * This is a debounced function
 */
const debouncedResize = debouncedFunction(function() {
  // manipulate divs
  const windowWidth = window.innerWidth;
  const innerDivs = imageContainer.children;
  // If the window is shrunk down to less than 700px, then 
  // remove the 2nd and 3rd column directly
  if (windowWidth < 700) {
    if (gridsPresent !== 1) {
      gridsPresent = 1;
      // do not remove the first node, so start from index 1
      for (let i = 1; i < innerDivs.length; i++) {
        imageContainer.removeChild(innerDivs[i]);
      }
      imageContainer.style.gridTemplateColumns ="repeat(1,1fr)";
    }
  // if the window is shrunk to the mid range view port then
  // either split half images from col1 and add to col3 or remove col3 altogether
  } else if (windowWidth >= 700 && windowWidth <= 1200) {
    // if resizing upwards from 700px
    if (gridsPresent < 2) {
      gridsPresent = 2;
      // create a new column
      col2 = document.createElement('div');
      col2.id = 'col-2';
      const col1FigureElements = col1.children;
      const col1FigureElementsLength = col1FigureElements.length;
      // remove half images from col1 and append to col2
      for (let i = col1FigureElementsLength - 1; i >= (col1FigureElementsLength / 2); i--) {
        let removedChild = col1.removeChild(col1FigureElements[i]);
        col2.appendChild(removedChild);
      }
      imageContainer.appendChild(col2);
      imageContainer.style.gridTemplateColumns ="repeat(2,1fr)";
      // as a new column is added, the scrollbar height might reduce, hence fetch some extra images
      fetchImages();
      // if resizing downwards from 1200 px
    } else if (gridsPresent > 2) {
      gridsPresent = 2;
      imageContainer.removeChild(imageContainer.children[2]); // remove the 3rd inner div
      imageContainer.style.gridTemplateColumns ="repeat(2,1fr)";
    }
  } else {
    const col1FigureElements = col1.children;
    const col1FigureElementsLength = col1FigureElements.length;
    switch (gridsPresent) {
      case 1:
        gridsPresent = 3;
        col2 = document.createElement('div');
        col2.id = 'col-2';
        // remove one-third images from col1 and append to col2
        for (let i = col1FigureElementsLength - 1; i >= (col1FigureElementsLength * 2 / 3); i--) {
          let removedChild = col1.removeChild(col1FigureElements[i]);
          col2.appendChild(removedChild);
        }

        col3 = document.createElement('div');
        col3.id = 'col-3';
        // remove remaining images from col1 and append to col3
        for (let i = col1FigureElementsLength - 1; i >= (col1FigureElementsLength / 2); i--) {
          let removedChild = col1.removeChild(col1FigureElements[i]);
          col3.appendChild(removedChild);
        }
        imageContainer.appendChild(col2);
        imageContainer.appendChild(col3);
        imageContainer.style.gridTemplateColumns ="repeat(3,1fr)";
        // as 2 new columns are added, the scrollbar height might reduce, hence fetch some extra images
        fetchImages();
        break;

      case 2:
        gridsPresent = 3;
        col3 = document.createElement('div');
        col3.id = 'col-3';
        // remove one-third images from col1 and append to col3
        for (let i = col1FigureElementsLength - 1; i >= (col1FigureElementsLength * 2 / 3); i--) {
          let removedChild = col1.removeChild(col1FigureElements[i]);
          col3.appendChild(removedChild);
        }
        // remove one-third images from col2 and append to col3
        const col2FigureElements = col2.children;
        const col2FigureElementsLength = col2FigureElements.length;
        for (let i = col2FigureElementsLength - 1; i >= (col2FigureElementsLength * 2 / 3); i--) {
          let removedChild = col2.removeChild(col2FigureElements[i]);
          col3.appendChild(removedChild);
        }
        imageContainer.appendChild(col3);
        imageContainer.style.gridTemplateColumns ="repeat(3,1fr)";
        // as a new columns is added, the scrollbar height might reduce, hence fetch some extra images
        fetchImages();
        break;

    }
  }
}, SCROLL_DEBOUNCE_DELAY);


const searchQueryFunction = (event, textFromClick) => {
  const query = textFromClick || (event ? event.target.value: null);
  const defaultUrl = getAPIUrl(IMAGE_COUNT);
  if (query && query.length) {
    removeBtn.hidden = false;
    apiUrl = `${defaultUrl}&query=${query.trim()}`
  } else {
    removeBtn.hidden = true;
    apiUrl = defaultUrl;
  }
  imagesArray = [];
  // Remove all DOM elements
  for (let i = 0; i < imageContainer.children.length; i++) {
    let column = imageContainer.children[i];
    for (let j = column.children.length - 1; j >= 0; j--) {
      column.removeChild(column.children[j]);
    }
  }
  showLoading();
  fetchImages();
}

const debouncedSearch = debouncedFunction(searchQueryFunction, SEARCH_DEBOUNCE_DELAY);

/**
 * Scroll Event listener
 * Fetch more images whenever scrollY is just reaching the 
 * end of the image container
 * 
 */
window.addEventListener('scroll', scrollerCallback);
window.addEventListener('resize', debouncedResize);
searchInput.addEventListener('input', debouncedSearch);
searchBtn.addEventListener('click', () => {
  if (searchInput.value && searchInput.value.length) {
    searchQueryFunction(null, searchInput.value);
  }
});
removeBtn.addEventListener('click', () => {
  searchInput.value = null;
  searchQueryFunction();
});
createInnerDivs();
// Start Fetching Images
fetchImages();