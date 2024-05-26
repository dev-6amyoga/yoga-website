import { Card } from "@geist-ui/core";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaBars } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";

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
      <div className="flex flex-col items-center gap-8 md:gap-12 justify-center font-mono md:text-5xl text-2xl w-full min-h-screen">
        <Card hoverable type="dark">
          <div className="flex flex-col items-center gap-12 text-xl md:gap-12 justify-center font-mono">
            <Link
              to="/"
              className="text-white font-bold hover:text-white transition-colors"
            >
              HOME
            </Link>

            <Link
              to="/pricing"
              className="text-white font-bold hover:text-white transition-colors"
            >
              PLANS & PRICING
            </Link>

            <Link
              to="/privacy"
              className="text-white font-bold hover:text-white transition-colors"
            >
              PRIVACY POLICY
            </Link>

            <Link
              to="/terms-and-conditions"
              className="text-white font-bold hover:text-white transition-colors"
            >
              TERMS & CONDITIONS
            </Link>

            <Link
              to="/cancellations"
              className="text-white font-bold hover:text-white transition-colors"
            >
              CANCELLATION AND REFUNDS
            </Link>

            <Link
              to="/contact-us"
              className="text-white font-bold hover:text-white transition-colors"
            >
              CONTACT
            </Link>

            <Link
              to="/auth"
              className="text-white font-bold hover:text-white transition-colors"
            >
              LOGIN/REGISTER
            </Link>
          </div>
        </Card>
      </div>
    );
  };
  return (
    <div className="">
      <div className="fixed top-0 z-[100]">
        <div className="min-h-screen w-12 ">
          <div className="h-screen flex items-center justify-center pointer-events">
            <div
              className="w-7 h-7 text-black hover:cursor-pointer"
              onClick={handleNavbarToggle}
            >
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
                    <FaBars className="w-full h-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`h-full bg-grey-900 bg-opacity-40 backdrop-blur-md fixed top-0 z-50 text-white text-2xl ${open ? "w-full" : "w-0"} pointer-events transition-all duration-500`}
      >
        <div
          className={`${open ? "opacity-100" : "opacity-0"} delay-100 duration-100 transition-all ${contentVisible ? "block" : "hidden"}`}
        >
          <NavLinks />
        </div>
      </div>
    </div>
  );
}
