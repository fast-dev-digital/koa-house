import { FaWhatsapp } from "react-icons/fa";

const WhatsappFloat = () => {
  const whatsappNumber = "5519981924006"; // seu número no formato internacional sem + (ex: 55 + DDD + número)

  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-6
        right-6
        bg-green-500
        hover:bg-green-600
        text-white
        rounded-full
        shadow-lg
        flex
        items-center
        space-x-3
        px-4
        py-3
        cursor-pointer
        transition
        duration-300
        z-50
      "
      aria-label="Chat no WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
    </a>
  );
};

export default WhatsappFloat;
