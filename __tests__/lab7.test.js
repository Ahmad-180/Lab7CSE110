describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  // -------------- STEP 0  (already supplied) -----------------
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');
    const numProducts = await page.$$eval('product-item', (prodItems) => prodItems.length);
    expect(numProducts).toBe(20);
  });

  // -------------- STEP 1  ------------------------------------
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated…');

    const prodItems = await page.$$('product-item');
    let allArePopulated = true;

    for (let i = 0; i < prodItems.length; ++i) {
      console.log(`Checking product item ${i + 1}/${prodItems.length}`);
      const dataHandle = await prodItems[i].getProperty('data');
      const data = await dataHandle.jsonValue();          // ⇐ JSON inside <product-item>

      // verify every key we care about is non-empty
      if (!data.title   || data.title.length   === 0) allArePopulated = false;
      if (!data.price   || data.price.length   === 0) allArePopulated = false;
      if (!data.image   || data.image.length   === 0) allArePopulated = false;
    }
    expect(allArePopulated).toBe(true);
  }, 10_000);

  // -------------- STEP 2  ------------------------------------
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button…');

    // grab the first <product-item>
    const prodItem = await page.$('product-item');

    // reach into its shadow DOM and pull out the <button>
    const buttonHandle = await prodItem.evaluateHandle(
      (elem) => elem.shadowRoot.querySelector('button')
    );

    // click & read the updated text
    await buttonHandle.click();
    const innerText = await (await buttonHandle.getProperty('innerText')).jsonValue();

    expect(innerText).toBe('Remove from Cart');
  }, 2_500);

  // -------------- STEP 3  ------------------------------------
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen…');

    const prodItems = await page.$$('product-item');

    // add every item that is NOT already in the cart
    for (const item of prodItems) {
      const btn = await item.evaluateHandle((elem) =>
        elem.shadowRoot.querySelector('button')
      );
      const txt = await (await btn.getProperty('innerText')).jsonValue();
      if (txt === 'Add to Cart') await btn.click();
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(cartCount).toBe('20');
  }, 10_000);

  // -------------- STEP 4  ------------------------------------
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload…');
    await page.reload();

    const prodItems = await page.$$('product-item');
    let allButtonsCorrect = true;

    for (const item of prodItems) {
      const btn = await item.evaluateHandle((elem) =>
        elem.shadowRoot.querySelector('button')
      );
      const txt = await (await btn.getProperty('innerText')).jsonValue();
      if (txt !== 'Remove from Cart') allButtonsCorrect = false;
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);

    expect(allButtonsCorrect).toBe(true);
    expect(cartCount).toBe('20');
  }, 10_000);

  // -------------- STEP 5  ------------------------------------
  it('Checking the localStorage to make sure cart is correct', async () => {
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe(
      '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]'
    );
  });

  // -------------- STEP 6  ------------------------------------
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Removing all items from cart…');

    const prodItems = await page.$$('product-item');

    for (const item of prodItems) {
      const btn = await item.evaluateHandle((elem) =>
        elem.shadowRoot.querySelector('button')
      );
      const txt = await (await btn.getProperty('innerText')).jsonValue();
      if (txt === 'Remove from Cart') await btn.click();
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
    expect(cartCount).toBe('0');
  }, 10_000);

  // -------------- STEP 7  ------------------------------------
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload…');
    await page.reload();

    const prodItems = await page.$$('product-item');
    let allButtonsCorrect = true;

    for (const item of prodItems) {
      const btn = await item.evaluateHandle((elem) =>
        elem.shadowRoot.querySelector('button')
      );
      const txt = await (await btn.getProperty('innerText')).jsonValue();
      if (txt !== 'Add to Cart') allButtonsCorrect = false;
    }

    const cartCount = await page.$eval('#cart-count', (el) => el.innerText);

    expect(allButtonsCorrect).toBe(true);
    expect(cartCount).toBe('0');
  }, 10_000);

  // -------------- STEP 8  ------------------------------------
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage…');
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBe('[]');
  });
});
