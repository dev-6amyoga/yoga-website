import { Button, Drawer } from "@geist-ui/core";
import { Menu, X } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGripLines, FaX } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { AnimatePresence, motion } from "framer-motion";

// export default function GeneralNavbar() {
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);

//   const NavLinks = () => {
//     return (
//       <>
//         <Link to="/" className="text-white">
//           Home
//         </Link>
//         <Link to="/about-us" className="text-white">
//           About
//         </Link>
//         <Link to="/pricing" className="text-white">
//           Plans & Pricing
//         </Link>
//         <Link to="/contact-us" className="text-white">
//           Contact
//         </Link>
//         <Button
//           auto
//           onClick={() => {
//             navigate("/auth", { state: { login: true } });
//           }}
//         >
//           Login
//         </Button>
//         <Button
//           auto
//           type="success"
//           onClick={() => {
//             navigate("/auth", { state: { login: false } });
//           }}
//         >
//           Register Now!
//         </Button>
//       </>
//     );
//   };

//   return (
//     <div className="h-16 bg-zinc-900 text-white px-4 shadow-sm flex items-center justify-between">
//       <div className="flex gap-4 items-center h-full">
//         <img src="/logo_6am.png" alt="6AM Yoga Logo" className="h-6" />
//         <h1 className="text-base md:text-xl">My Yoga Teacher</h1>
//       </div>
//       <nav className="md:flex gap-4 items-center hidden text-white">
//         <NavLinks />
//       </nav>
//       <div className="md:hidden">
//         <Button
//           auto
//           icon={<Menu />}
//           scale={0.8}
//           onClick={() => setOpen((p) => !p)}
//         ></Button>
//       </div>
//       <Drawer
//         visible={open}
//         onClose={() => setOpen(false)}
//         placement="left"
//         width="90%"
//         className=""
//         wrapClassName="relative block md:hidden"
//       >
//         <Drawer.Title>My Yoga Teacher</Drawer.Title>
//         <Drawer.Content className="relative">
//           <button
//             className="absolute -top-9 right-4 px-2 py-1 border rounded-lg"
//             onClick={() => setOpen(false)}
//           >
//             <X className="w-5 h-5" />
//           </button>
//           <div className="flex flex-col gap-6 my-4 items-center text-xl">
//             <NavLinks />
//           </div>
//         </Drawer.Content>
//       </Drawer>
//     </div>
//   );
// }

export default function GeneralNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const handleNavbarToggle = () => {
    setOpen((p) => !p);

    if (contentVisible) {
      setTimeout(() => {
        setContentVisible((p) => !p);
      }, 400);
    } else {
      setTimeout(() => {
        setContentVisible((p) => !p);
      }, 400);
    }
  };

  const NavLinks = () => {
    return (
      <div className="flex flex-col py-20 items-center gap-8 hover:gap-12 justify-items-center font-mono text-5xl">
        <Link to="/" className="text-white">
          HOME
        </Link>
        <Link to="/about-us" className="text-white">
          ABOUT
        </Link>
        <Link to="/pricing" className="text-white">
          PLANS & PRICING
        </Link>
        <Link to="/contact-us" className="text-white">
          CONTACT
        </Link>
        <Link to="/auth" className="text-white">
          LOGIN/REGISTER
        </Link>
      </div>
    );
  };
  return (
    <div className="w-full h-screen">
      <div className="fixed top-0 z-[100]">
        <div className="min-h-screen w-12">
          <div className="h-screen flex items-center justify-center pointer-events">
            <div className="w-7 h-7 text-white" onClick={handleNavbarToggle}>
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="open"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                  >
                    <RxCross1 className="w-full h-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="close"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                  >
                    <FaGripLines className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`h-full bg-grey-900 bg-opacity-60 backdrop-blur-sm fixed top-0 z-50 text-white text-2xl ${open ? "w-full" : "w-0"} pointer-events transition-all duration-500`}
      >
        <div
          className={`${open ? "opacity-100" : "opacity-0"} delay-100 duration-100 transition-all ${contentVisible ? "block" : "hidden"}`}
        >
          <div className="flex flex-col space-around items-center">
            <NavLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
