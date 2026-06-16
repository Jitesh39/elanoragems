export interface PolicySection {
  title: string;
  content: string;
}

export interface PolicyData {
  lastUpdated: string;
  sections: PolicySection[];
  returnWindow?: number; // Used for refund policy
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  title: string;
  items: FAQItem[];
}

export interface FAQData {
  lastUpdated: string;
  sections: FAQSection[];
}

export const DEFAULT_FAQ: FAQData = {
  lastUpdated: "June 16, 2026",
  sections: [
    {
      title: "Orders & Payments",
      items: [
        {
          question: "How do I place an order?",
          answer: "Browse our collections, select your desired piece, select the size (if applicable), and click 'Add to Cart'. Once you're ready, proceed to checkout, enter your shipping details, and choose your preferred payment method."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit and debit cards, UPI payments, net banking, and popular mobile wallets. Cash on Delivery (COD) is also available for select pin codes within India."
        },
        {
          question: "Can I cancel my order?",
          answer: "Yes, you can cancel your order within 2 hours of placing it. Please contact our support team at gemselanora@gmail.com or call our customer care helpline to request a cancellation. Once the order is shipped, it cannot be cancelled."
        }
      ]
    },
    {
      title: "Shipping",
      items: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping typically takes 3 to 5 business days for metro cities, and 5 to 7 business days for other regions in India. High-demand handcrafted items may take slightly longer."
        },
        {
          question: "Do you offer free shipping?",
          answer: "Yes, we offer free shipping on all orders above ₹999 within India. For orders below ₹999, a standard shipping charge of ₹99 is applicable."
        },
        {
          question: "How can I track my order?",
          answer: "Once your order is dispatched, we will send you an email and SMS with a tracking number and a link to trace your shipment. You can also track it directly on our website using the 'Track Your Order' link."
        }
      ]
    },
    {
      title: "Products",
      items: [
        {
          question: "Are your jewellery pieces handcrafted?",
          answer: "Yes, all ElanoraGems jewellery pieces are meticulously hand-crafted by master artisans. Each design is unique and reflects our commitment to premium craftsmanship."
        },
        {
          question: "What materials are used?",
          answer: "We use certified 92.5% sterling silver as our base metal. For gold pieces, we apply a thick layer of premium 18K gold plating (vermeil) to ensure durability, brilliance, and a luxurious finish. All our pieces are hypoallergenic, nickel-free, and lead-free."
        },
        {
          question: "Do you provide certificates?",
          answer: "Absolutely. Every purchase from ElanoraGems comes with an official certificate of authenticity specifying the metal purity (92.5% silver) and verifying any gemstones used."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      items: [
        {
          question: "What is your return policy?",
          answer: "We offer a hassle-free 15-day return and exchange policy from the date of delivery. The item must be unused, in its original packaging, and with all security tags intact."
        },
        {
          question: "When will I receive my refund?",
          answer: "Once we receive and verify the returned item at our warehouse, your refund will be processed within 5-7 business days. It will be credited back to your original payment method or issued as store credit, depending on your preference."
        }
      ]
    }
  ]
};

export const DEFAULT_PRIVACY: PolicyData = {
  lastUpdated: "June 16, 2026",
  sections: [
    {
      title: "Information We Collect",
      content: "We collect personal details such as your name, email address, shipping and billing addresses, phone number, and payment information when you place an order, create an account, or contact our support team. We also collect automated information regarding your device and browser usage through cookies."
    },
    {
      title: "How We Use Information",
      content: "Your information is used to process and fulfill orders, handle payments, send shipping updates, personalize your browsing experience, and (with your consent) send promotional offers and newsletters. We also analyze aggregated data to optimize our website design and inventory."
    },
    {
      title: "Cookies & Analytics",
      content: "ElanoraGems uses cookies and similar tracking technologies to store your preferences, keep items in your shopping cart, and compile analytics on website traffic. You can modify your browser settings to reject cookies, though some features of the store may not function optimally."
    },
    {
      title: "Third-Party Services",
      content: "We share your information with verified third-party partners only to the extent necessary to deliver our services. This includes secure payment processors (e.g., Razorpay, Stripe) and reliable shipping/courier services. We do not sell, rent, or trade your personal information to third parties for marketing purposes."
    },
    {
      title: "Data Security",
      content: "We employ robust physical, electronic, and administrative safeguards to protect your personal data. All online transactions are processed using industry-standard Secure Sockets Layer (SSL) encryption. While we take maximum precautions, no transmission over the internet is completely secure."
    },
    {
      title: "User Rights",
      content: "You have the right to request access to the personal data we hold about you, request corrections to inaccurate details, or request that your information be deleted from our systems. You can also opt-out of marketing communications at any time by clicking the unsubscribe link in our emails."
    },
    {
      title: "Contact Information",
      content: "For any questions or concerns regarding our privacy practices or to exercise your data rights, please contact the ElanoraGems Privacy Officer at gemselanora@gmail.com. You can also learn more on our website at https://elanoragems.in."
    }
  ]
};

export const DEFAULT_TERMS: PolicyData = {
  lastUpdated: "June 16, 2026",
  sections: [
    {
      title: "Website Usage",
      content: "By visiting and purchasing from ElanoraGems (https://elanoragems.in), you agree to comply with and be bound by these Terms and Conditions. These terms apply to all visitors, users, and customers of the website. If you do not agree to these terms, you must discontinue use immediately."
    },
    {
      title: "Product Information",
      content: "We make every effort to display the dimensions, colors, and materials of our jewellery pieces as accurately as possible. However, because each piece is handcrafted and computer monitors display colors differently, minor variations may occur. All designs remain the intellectual property of ElanoraGems."
    },
    {
      title: "Pricing",
      content: "All prices on our website are listed in Indian Rupees (INR) and are inclusive of standard taxes, unless otherwise specified. We reserve the right to alter prices, modify collections, or withdraw items without prior notice. In the event of a pricing error, we reserve the right to cancel any affected orders."
    },
    {
      title: "Payments",
      content: "We accept payments via major credit cards, debit cards, UPI, net banking, and Cash on Delivery (COD) in select pin codes. By initiating a payment, you warrant that you are authorized to use the chosen payment source. All transactions must clear before your order is processed for shipping."
    },
    {
      title: "Order Acceptance",
      content: "Your receipt of an order confirmation does not signify our acceptance of your order. ElanoraGems reserves the right to accept, decline, or limit your order at any time after receipt for reasons including product stock issues, regional shipping constraints, or suspicious activity."
    },
    {
      title: "Limitation of Liability",
      content: "ElanoraGems, its partners, and employees shall not be liable for any indirect, special, incidental, or consequential damages arising out of the use, performance, or wear of our products, or the use of our website. In no event shall our liability exceed the purchase price of the product."
    },
    {
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of India. Any legal actions or disputes arising from your use of this website or purchases made on it shall be submitted to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra."
    },
    {
      title: "Contact Information",
      content: "Please direct any queries regarding our Terms and Conditions to our compliance team at gemselanora@gmail.com."
    }
  ]
};

export const DEFAULT_REFUND: PolicyData = {
  lastUpdated: "June 16, 2026",
  returnWindow: 15,
  sections: [
    {
      title: "Eligibility for Returns",
      content: "To be eligible for a return or exchange, your item must be unused, in the same pristine condition that you received it, and in its original luxury packaging. It must also have all original tags and tamper-evident security loops attached and unbroken."
    },
    {
      title: "Return Window",
      content: "Our standard return and exchange window is 15 days from the date of delivery. Return requests submitted after this timeframe will not be accepted. This window may be configured dynamically under store settings."
    },
    {
      title: "Refund Process",
      content: "To initiate a return, log into your ElanoraGems account, navigate to 'My Orders', select the item you wish to return, and click 'Request Return'. You can also email us at gemselanora@gmail.com with your Order ID. We will schedule a reverse pickup from your registered address."
    },
    {
      title: "Non-Returnable Items",
      content: "Certain items cannot be returned, including custom-sized jewellery, engraved items, personalized gifts, and items purchased during clearout or final sale events. For hygiene reasons, pierced earrings cannot be returned if their security seal has been opened."
    },
    {
      title: "Damaged Product Claims",
      content: "Every piece of jewellery undergoes rigorous quality checks before dispatch. In the rare event that your item arrives damaged, defective, or incorrect, you must report it to us within 48 hours of delivery at gemselanora@gmail.com, accompanied by a video showing the unboxing of the sealed package."
    },
    {
      title: "Refund Timeline",
      content: "Once your returned item is received at our warehouse and passes our quality inspection, we will notify you of the approval or rejection of your refund. Approved refunds are credited to your original payment method within 5 to 7 business days, or provided as store credit."
    }
  ]
};

export const DEFAULT_SHIPPING: PolicyData = {
  lastUpdated: "June 16, 2026",
  sections: [
    {
      title: "Processing Time",
      content: "Standard orders are processed and prepared for shipping within 1 to 2 business days. Hand-crafted, custom-made, or personalized items may require 3 to 5 additional business days for production before shipment. Orders are not processed on Sundays and national holidays."
    },
    {
      title: "Delivery Time",
      content: "Delivery typically takes 3 to 5 business days for major metropolitan areas (e.g., Mumbai, Delhi, Bengaluru) and 5 to 7 business days for regional and non-metro cities within India. Delivery estimates are indicative and commence from the date of dispatch."
    },
    {
      title: "Shipping Charges",
      content: "We offer Free Standard Shipping across India on all orders of value ₹999 and above. For orders below ₹999, a flat shipping fee of ₹99 is added to the cart total at checkout. All shipping charges are non-refundable."
    },
    {
      title: "Order Tracking",
      content: "Once your package is handed over to our courier partner, we will email and SMS you a shipping confirmation containing a tracking number and a link. You can track your shipment status in real-time on the delivery partner's portal."
    },
    {
      title: "Delays & Exceptions",
      content: "While we work with leading national logistics partners, delays may occasionally occur due to extreme weather conditions, public holidays, regional blockades, or custom checks. We will proactively notify you of any known transit delays."
    },
    {
      title: "International Shipping",
      content: "Currently, ElanoraGems only ships to addresses within India. We are working on expanding our delivery network to select international locations and will update our customers once global shipping is active."
    }
  ]
};

export const DEFAULT_TERMS_OF_USE: PolicyData = {
  lastUpdated: "June 16, 2026",
  sections: [
    {
      title: "Acceptable Use",
      content: "You agree to use this website (https://elanoragems.in) only for lawful purposes related to browsing and purchasing ElanoraGems products. You must not use this website in any manner that disrupts server performance, damages our systems, or infringes upon others' ability to enjoy the site."
    },
    {
      title: "Intellectual Property",
      content: "All content available on this website, including but not limited to brand logos, product designs, graphics, images, site layouts, text, button icons, audio clips, and software, is the exclusive property of ElanoraGems and is protected by Indian and international copyright and trademark laws."
    },
    {
      title: "User Responsibilities",
      content: "You are responsible for maintaining the accuracy of any information you submit to our website. You agree not to upload any content that contains computer viruses, malware, trojans, or anything that violates local cyber legislation."
    },
    {
      title: "Account Security",
      content: "If you create an account, you are solely responsible for protecting your account credentials and password. You agree to assume responsibility for all activities that take place under your account, and to notify us immediately of any unauthorized access."
    },
    {
      title: "Prohibited Activities",
      content: "You may not copy, frame, scrape, extract, reproduce, republish, or distribute any part of this website without our express written consent. Unauthorized use of data mining tools, bots, or similar extraction methods is strictly prohibited."
    },
    {
      title: "Disclaimer",
      content: "This website and its services are provided on an 'as is' and 'as available' basis. ElanoraGems makes no warranties, express or implied, including the implied warranties of merchantability, fitness for a particular purpose, or non-infringement, regarding site uptime or accuracy."
    },
    {
      title: "Termination Rights",
      content: "We reserve the right, without warning and in our sole discretion, to terminate your account or block your access to this website if we believe your actions violate these Terms of Use, local law, or represent a security threat to our systems."
    }
  ]
};

export const defaultPoliciesMap: Record<string, PolicyData | FAQData> = {
  faq: DEFAULT_FAQ,
  privacy: DEFAULT_PRIVACY,
  terms: DEFAULT_TERMS,
  refund: DEFAULT_REFUND,
  shipping: DEFAULT_SHIPPING,
  "terms-of-use": DEFAULT_TERMS_OF_USE,
};
