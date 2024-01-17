import useUserStore from "../store/UserStore";
import React, { useEffect } from "react";

// export default function withAuth(Component) {
//   return function AuthenticatedPage(props) {
//     let user = useUserStore((state) => state.user);

//     useEffect(() => {}, [user]);
//     return (
//       <>
//         {user ? (
//           <Component {...props} />
//         ) : (
//           <div className="min-h-screen grid place-content-center">
//             <div className="text-center">Unauthorized Access</div>
//           </div>
//         )}
//       </>
//     );
//   };
// }

// https://blog.logrocket.com/understanding-react-higher-order-components/
// thjis is basically same as this?!?2?1@?1@

// const withEnhancement = (BaseComponent) => {
//   // HOC logic using hooks
//   return function EnhancedComponent(props) {
//     // HOC-specific logic using hooks
//     return <BaseComponent {...props} enhancedProp="someValue" />;
//   };
// };

export const withAuth = (props) => {
  return <div></div>;
};

//  const user = useUserStore(state => state.user)

//  useEffect(() => {}, [user])

//   user ? <>{}</>
