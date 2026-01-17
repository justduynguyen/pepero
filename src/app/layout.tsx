import type { Metadata, Viewport } from "next"; // Đã thêm Viewport vào import
// import { Be_Vietnam_Pro, Rubik } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import OrderNotification from "@/components/OrderNotification";

// Disabled fonts due to Docker build network issue
/*
// Primary font for body text (clean, modern)
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-vietnam",
  display: "swap",
});

// Secondary font for headings/accents (rounder, cuter)
const rubik = Rubik({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "latin-ext"],
  variable: "--font-rubik",
  display: "swap",
});
*/

export const metadata: Metadata = {
  title: "Ngọt Ngào Pepero - Set Tự Làm",
  description: "Đặt mua set nguyên liệu làm bánh Pepero, socola tự làm tặng người yêu.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍫</text></svg>",
  },
};

// MỚI: Cấu hình Viewport để chặn Zoom trên Mobile
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn người dùng zoom (fix lỗi input zoom)
  interactiveWidget: "resizes-visual", // Giúp layout co lại đẹp khi bàn phím hiện lên
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        // className={`${beVietnamPro.variable} ${rubik.variable} antialiased font-sans bg-rose-50 text-gray-800`}
        className={`antialiased font-sans bg-rose-50 text-gray-800`}
        suppressHydrationWarning
      >
        <CartProvider>
          <OrderNotification />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}