// Find the main UI elements on the page.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');
const container = document.querySelector('.container');

// Apply the shared date picker setup from the helper file.
setupDateInputs(startInput, endInput);

// Create the reusable modal and add the rotating fact card above the gallery.
const modal = createModal();
gallery.setAttribute('aria-live', 'polite');

const factCard = createFactCard();
container.insertBefore(factCard, gallery);

let lastFocusedElement = null;

// Fetch new APOD results when the button is pressed.
getImagesButton.addEventListener('click', async () => {
  const { startDate, endDate } = getSelectedDates();

  if (!startDate || !endDate) {
    showStatus('Please choose both a start and end date.', '⚠️');
    return;
  }

  showLoadingState();

  try {
    const apodData = await fetchApodData(startDate, endDate);
    console.log('NASA APOD data:', apodData);
    renderGallery(apodData);
  } catch (error) {
    console.error('Unable to load NASA APOD data:', error);
    showStatus('Sorry, we could not load the space images right now. Please try again.', '⚠️');
  }
});

// Open the detail modal when a gallery card is activated.
gallery.addEventListener('click', (event) => {
  const card = event.target.closest('.gallery-item');

  if (!card || !card.apodItem) {
    return;
  }

  openModal(card.apodItem);
});

// Read the selected dates from the date inputs.
function getSelectedDates() {
  return {
    startDate: startInput.value,
    endDate: endInput.value
  };
}

// Fetch Astronomy Picture of the Day data from NASA's API.
async function fetchApodData(startDate, endDate) {
  const apiKey = 'ndZ9P3JM0n4gVr5LRPNEoaXFSlPdVf18h23XPckn';
  const url = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// Clear the current gallery content before rendering new results.
function clearGallery() {
  gallery.innerHTML = '';
}

// Show a loading state while the request is in progress.
function showLoadingState() {
  clearGallery();
  const card = createStatusCard('🔄 Loading space photos...', 'loading');
  gallery.appendChild(card);
}

// Show a friendly status message inside the gallery area.
function showStatus(message, icon = '🔭') {
  clearGallery();
  const card = createStatusCard(message, icon, false);
  gallery.appendChild(card);
}

// Build a shared status card for loading or informational messages.
function createStatusCard(message, icon, isLoading = false) {
  const messageBox = document.createElement('div');
  messageBox.className = 'placeholder status-card';
  messageBox.setAttribute('role', isLoading ? 'status' : 'note');
  messageBox.setAttribute('aria-live', 'polite');

  if (isLoading) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    const text = document.createElement('p');
    text.className = 'loading-text';
    text.textContent = message;

    messageBox.append(spinner, text);
    return messageBox;
  }

  const iconElement = document.createElement('div');
  iconElement.className = 'placeholder-icon';
  iconElement.textContent = icon;
  iconElement.setAttribute('aria-hidden', 'true');

  const text = document.createElement('p');
  text.textContent = message;

  messageBox.append(iconElement, text);
  return messageBox;
}

// Render the fetched APOD items as gallery cards.
function renderGallery(apodData) {
  clearGallery();

  if (!Array.isArray(apodData) || apodData.length === 0) {
    showStatus('No space images were found for that date range.', '🔭');
    return;
  }

  const fragment = document.createDocumentFragment();

  apodData.forEach((item) => {
    fragment.appendChild(createGalleryCard(item));
  });

  gallery.appendChild(fragment);
}

// Create one gallery card for each APOD item.
function createGalleryCard(item) {
  const card = document.createElement('article');
  card.className = 'gallery-item';
  card.apodItem = item;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open details for ${item.title}`);

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(item);
    }
  });

  const media = createMediaDisplay(item, 'gallery');

  const title = document.createElement('p');
  title.className = 'gallery-title';
  title.textContent = item.title;

  const date = document.createElement('p');
  date.className = 'gallery-date';
  date.textContent = item.date;

  card.append(media, title, date);
  return card;
}

// Create a random NASA fact card displayed above the gallery.
function createFactCard() {
  const facts = [
    'The Sun contains more than 99% of the mass in our solar system.',
    'A day on Venus is longer than a year on Venus.',
    'Jupiter has a storm so large that Earth could fit inside it many times.',
    'Mars once had rivers, lakes, and possibly a much thicker atmosphere.',
    'Neptune winds can reach speeds over 1,200 miles per hour.',
    'The Moon is slowly drifting away from Earth at about 3.8 centimeters per year.',
    'A full Moon looks larger near the horizon because of an optical illusion.',
    'Saturn would float in water because it is mostly made of gas.',
    'The Hubble Space Telescope has helped us see galaxies billions of light-years away.',
    'Astronauts on the ISS orbit Earth about 16 times each day.',
    'The Milky Way contains hundreds of billions of stars.',
    'A neutron star is so dense that a teaspoon of it would weigh billions of tons on Earth.',
    'Black holes do not “suck” everything in; they only pull strongly within a certain distance.',
    'Space is not completely empty; it contains interstellar gas and dust.',
    'The International Space Station is the size of a small city.',
    'A solar eclipse happens because the Moon is just the right size and distance to cover the Sun.',
    'Pluto is smaller than Earth’s Moon.',
    'Comets can have tails that stretch millions of miles.',
    'The largest volcano in the solar system is Olympus Mons on Mars.',
    'Some planets have rings made of countless icy particles.',
    'Light from the Sun takes about 8 minutes to reach Earth.',
    'The first human-made object in space was the Soviet satellite Sputnik 1.',
    'NASA has tested parachutes on Mars using the Ingenuity helicopter concept before flight.',
    'A year on Mercury lasts about 88 Earth days.'
  ];

  const randomFact = facts[Math.floor(Math.random() * facts.length)];

  const card = document.createElement('section');
  card.className = 'fact-card';

  const label = document.createElement('p');
  label.className = 'fact-label';
  label.textContent = 'Did You Know?';

  const fact = document.createElement('p');
  fact.className = 'fact-text';
  fact.textContent = randomFact;

  card.append(label, fact);
  return card;
}

// Build the reusable detail modal.
function createModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Astronomy image details');
  overlay.setAttribute('aria-labelledby', 'modal-title');
  overlay.setAttribute('aria-describedby', 'modal-description');

  const panel = document.createElement('div');
  panel.className = 'modal-panel';
  panel.setAttribute('tabindex', '-1');

  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.type = 'button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close image details');

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'modal-media';

  const heading = document.createElement('h2');
  heading.className = 'modal-title';
  heading.id = 'modal-title';

  const date = document.createElement('p');
  date.className = 'modal-date';

  const explanation = document.createElement('p');
  explanation.className = 'modal-explanation';
  explanation.id = 'modal-description';

  panel.append(closeButton, mediaWrapper, heading, date, explanation);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
  overlay.addEventListener('keydown', handleModalKeydown);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  return overlay;
}

// Create a media display for either gallery cards or the modal.
function createMediaDisplay(item, context) {
  const wrapper = document.createElement('div');
  wrapper.className = context === 'gallery' ? 'gallery-media' : 'modal-media-content';

  if (item.media_type === 'image' && item.url) {
    const image = document.createElement('img');
    image.className = context === 'gallery' ? 'gallery-image' : 'modal-image';
    image.src = item.url;
    image.alt = item.title || 'NASA APOD image';
    image.loading = 'lazy';

    image.addEventListener('error', () => {
      image.replaceWith(createFallbackMedia('Image unavailable', context));
    });

    wrapper.appendChild(image);
    return wrapper;
  }

  wrapper.appendChild(createFallbackMedia(item.media_type === 'video' ? 'NASA Video' : 'Image unavailable', context));
  return wrapper;
}

// Create a fallback media placeholder when imagery is unavailable.
function createFallbackMedia(label, context) {
  const placeholder = document.createElement('div');
  placeholder.className = context === 'gallery' ? 'gallery-placeholder' : 'modal-placeholder';

  const icon = document.createElement('div');
  icon.className = 'placeholder-icon';
  icon.textContent = context === 'gallery' ? '🛰️' : '📡';
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('p');
  text.textContent = label;

  placeholder.append(icon, text);
  return placeholder;
}

// Build video content for the modal when an APOD entry is a video.
function buildVideoContent(item) {
  const container = document.createElement('div');
  container.className = 'video-wrapper';

  if (!item.url) {
    const button = document.createElement('a');
    button.className = 'video-link';
    button.href = '#';
    button.textContent = 'Watch NASA Video';
    container.appendChild(button);
    return container;
  }

  if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
    const iframe = document.createElement('iframe');
    iframe.className = 'video-embed';
    iframe.src = getYouTubeEmbedUrl(item.url);
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
    return container;
  }

  if (item.url.includes('.mp4') || item.url.includes('.mov') || item.url.includes('.webm')) {
    const video = document.createElement('video');
    video.className = 'video-embed';
    video.src = item.url;
    video.controls = true;
    video.preload = 'metadata';
    container.appendChild(video);
    return container;
  }

  const button = document.createElement('a');
  button.className = 'video-link';
  button.href = item.url;
  button.target = '_blank';
  button.rel = 'noreferrer';
  button.textContent = 'Watch NASA Video';
  container.appendChild(button);
  return container;
}

// Convert a regular YouTube link into an embeddable URL.
function getYouTubeEmbedUrl(url) {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);

  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }

  return url;
}

// Trap focus inside the modal while it is open.
function handleModalKeydown(event) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// Open the modal with the selected APOD content.
function openModal(item) {
  lastFocusedElement = document.activeElement;

  const mediaWrapper = modal.querySelector('.modal-media');
  const title = modal.querySelector('.modal-title');
  const date = modal.querySelector('.modal-date');
  const explanation = modal.querySelector('.modal-explanation');

  mediaWrapper.innerHTML = '';

  if (item.media_type === 'video') {
    mediaWrapper.appendChild(buildVideoContent(item));
  } else {
    mediaWrapper.appendChild(createMediaDisplay(item, 'modal'));
  }

  title.textContent = item.title;
  date.textContent = item.date;
  explanation.textContent = item.explanation;

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  const closeButton = modal.querySelector('.modal-close');
  closeButton.focus();
}

// Close the modal and restore focus to the previously active element.
function closeModal() {
  if (!modal.classList.contains('is-open')) {
    return;
  }

  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}
