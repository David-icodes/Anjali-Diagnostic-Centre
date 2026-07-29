export type PublicServiceType = 'Laboratory' | 'Radiology'

export interface BookingCartItem {
  serviceId: string
  serviceType: PublicServiceType
  name: string
  price: number
}

export const BOOKING_CART_KEY = 'adc-booking-cart'

export function readBookingCart(): BookingCartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(BOOKING_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item) =>
      item
      && typeof item.serviceId === 'string'
      && (item.serviceType === 'Laboratory' || item.serviceType === 'Radiology')
      && typeof item.name === 'string'
      && typeof item.price === 'number'
    )
  } catch {
    return []
  }
}

export function writeBookingCart(items: BookingCartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BOOKING_CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('booking-cart-updated'))
}

export function clearBookingCart() {
  writeBookingCart([])
}

export function upsertBookingCartItem(item: BookingCartItem) {
  const cart = readBookingCart()
  const exists = cart.some((entry) => entry.serviceId === item.serviceId && entry.serviceType === item.serviceType)
  const next = exists
    ? cart.filter((entry) => !(entry.serviceId === item.serviceId && entry.serviceType === item.serviceType))
    : [...cart, item]

  writeBookingCart(next)
  return next
}

export function getBookingCartTotal(items: BookingCartItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
