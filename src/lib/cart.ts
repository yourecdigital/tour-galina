// Утилиты для работы с корзиной (localStorage)

export interface CartItem {
  id: number;
  title: string;
  price: number | null;
  image_url: string | null;
  slug: string | null;
}

const CART_KEY = "krasnaya_polyana_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cartData = localStorage.getItem(CART_KEY);
    if (!cartData) return [];
    return JSON.parse(cartData);
  } catch (error) {
    console.error("Ошибка при чтении корзины:", error);
    return [];
  }
}

export function addToCart(tour: CartItem): void {
  if (typeof window === "undefined") return;
  
  try {
    const cart = getCart();
    // Проверяем, нет ли уже этого тура в корзине
    if (!cart.find(item => item.id === tour.id)) {
      cart.push(tour);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      // Отправляем событие для обновления UI
      window.dispatchEvent(new Event("cartUpdated"));
    }
  } catch (error) {
    console.error("Ошибка при добавлении в корзину:", error);
  }
}

export function removeFromCart(tourId: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== tourId);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Ошибка при удалении из корзины:", error);
  }
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Ошибка при очистке корзины:", error);
  }
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price || 0), 0);
}

export function getCartCount(): number {
  return getCart().length;
}



