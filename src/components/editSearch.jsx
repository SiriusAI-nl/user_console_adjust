"use client";

import { useState, useEffect } from "react";
import { MdStarBorder } from "react-icons/md";
import { AlignLeft, Clipboard, Clock, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const EditSearch = ({ setIsPlanning, setMenuOpen }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/plan`);
      setPlans(response.data.plan);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [API_URL]); // Added API_URL as a dependency

  return (
    <div
      id="main"
      className="w-full max-w-[710px] px-[30px] md:px-[30px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border border-gray-700 py-[30px] rounded-[10px] lg:px-[30px] overflow-hidden hover:border-purple-500 transition-colors duration-300"
    >
      <div className="text-purple-500 flex gap-4">
        <div className="w-[5%] flex flex-col items-center gap-4">
          <Copy size={25} />
          <div className="rounded-full w-[2px] h-[60%] bg-purple-500"></div>
          <AlignLeft size={25} />
          <Clipboard size={25} />
          <Clock size={25} />
        </div>
        <div className="w-[95%]">
          <div className="w-full flex items-center gap-[10px] mb-[15px]">
            <MdStarBorder className="text-2xl text-purple-500" />
            <p className="font-Montserrat text-[16px] font-[500]">
            Market Research planning
            </p>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center w-full border-b dark:border-white border-[#34006133] pb-[11px]"
                  >
                    <div className="w-full h-[2px] bg-[#d1d1d1] rounded animate-pulse"></div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ height: 0 }}
                animate={{ height: showAll ? "300px" : "150px" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="border border-gray-700 rounded-md p-2 overflow-hidden"
                style={{
                  overflowY: showAll ? "auto" : "hidden",
                  maxHeight: "300px",
                }}
              >
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className="flex gap-[25px] items-center w-full hover:bg-gray-700 pb-[6px] px-2 rounded transition-colors duration-200"
                  >
                    <div className="flex items-center gap-[12px] w-full">
                      <h1
                        className="font-Montserrat text-[13px] text-gray-300 font-[400] flex items-center break-words w-full"
                      >
                        {plan}
                      </h1>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {!loading && plans.length > 4 && (
              <button
                className="text-white mt-4 py-1 px-2 rounded-md"
                style={{
                  backgroundColor: "#A854F7",
                  fontSize: "12px",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "500",
                }}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            )}
          </AnimatePresence>

          <p className="font-Montserrat text-[14px] font-normal pt-[20px]">
            Estimated completion time: 5 minutes
          </p>

          <div className="flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px]">
            <button className="text-white bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] transition-colors duration-300">
              Edit Plan
            </button>
            <button
              className="text-white bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] transition-colors duration-300"
              onClick={() => {
                setIsPlanning(true);
                setMenuOpen(false);
              }}
            >
              Show Keyword Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSearch;



// "use client";

// import { useState, useEffect } from "react";
// import { MdStarBorder } from "react-icons/md";
// import { AlignLeft, Clipboard, Clock, Copy } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

// const EditSearch = ({ setIsPlanning, setMenuOpen }) => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAll, setShowAll] = useState(false);

//   const fetchPlans = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/api/plan`);
//       setPlans(response.data.plan);
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlans();
//   }, [API_URL]); // Added API_URL as a dependency

//   return (
//     <div
//       id="main"
//       className="w-full max-w-[610px] px-[30px] md:px-[50px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border border-gray-700 py-[30px] rounded-[10px] lg:px-[50px] overflow-hidden hover:border-purple-500 transition-colors duration-300"
//     >
//       <div className="text-purple-500 flex gap-6">
//         <div className="w-[5%] flex flex-col items-center gap-4">
//           <Copy size={20} />
//           <div className="rounded-full w-[2px] h-[60%] bg-purple-500"></div>
//           <AlignLeft size={20} />
//           <Clipboard size={20} />
//           <Clock size={20} />
//         </div>
//         <div className="w-[95%]">
//           <div className="w-full flex items-center gap-[10px] mb-[15px]">
//             <MdStarBorder className="text-2xl text-purple-500" />
//             <p className="font-Montserrat text-[16px] font-[500]">
//             Market Research planning
//             </p>
//           </div>

//           <AnimatePresence mode="wait">
//             {loading ? (
//               <motion.div
//                 key="skeleton"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               >
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center w-full border-b dark:border-white border-[#34006133] pb-[11px]"
//                   >
//                     <div className="w-full h-[2px] bg-[#d1d1d1] rounded animate-pulse"></div>
//                   </div>
//                 ))}
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="content"
//                 initial={{ height: 0 }}
//                 animate={{ height: showAll ? "300px" : "auto" }}
//                 transition={{ duration: 0.5, ease: "easeInOut" }}
//                 className="border border-gray-700 rounded-md p-2 overflow-hidden"
//                 style={{
//                   overflowY: showAll ? "auto" : "hidden",
//                   maxHeight: "300px",
//                 }}
//               >
//                 {plans.map((plan, index) => (
//                   <div
//                     key={index}
//                     className="flex gap-[25px] items-center w-full hover:bg-gray-700 pb-[11px] px-2 rounded transition-colors duration-200"
//                   >
//                     <div className="flex items-center gap-[12px]">
//                       <h1
//                         className="font-Montserrat text-[13px] text-gray-300 font-[400] h-[30px] py-[10px] flex items-center"
//                         style={{
//                           maxWidth: "500px",
//                           overflow: "hidden",
//                           whiteSpace: "nowrap",
//                           textOverflow: "ellipsis",
//                         }}
//                       >
//                         {plan}
//                       </h1>
//                     </div>
//                   </div>
//                 ))}
//               </motion.div>
//             )}
//             {!loading && plans.length > 4 && (
//               <button
//                 className="text-white mt-4 py-1 px-2 rounded-md"
//                 style={{
//                   backgroundColor: "#A854F7",
//                   fontSize: "12px",
//                   fontFamily: "Montserrat, sans-serif",
//                   fontWeight: "500",
//                 }}
//                 onClick={() => setShowAll(!showAll)}
//               >
//                 {showAll ? "Show Less" : "Show More"}
//               </button>
//             )}
//           </AnimatePresence>

//           <p className="font-Montserrat text-[14px] font-normal pt-[20px]">
//             Estimated completion time: 5 minutes
//           </p>

//           <div className="flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px]">
//             <button className="text-white bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] transition-colors duration-300">
//               Edit Plan
//             </button>
//             <button
//               className="text-white bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px] transition-colors duration-300"
//               onClick={() => {
//                 setIsPlanning(true);
//                 setMenuOpen(false);
//               }}
//             >
//               Show Keyword Report
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditSearch;

// import React, { useState, useEffect } from "react";
// import { MdStarBorder } from "react-icons/md";
// import { GoDotFill } from "react-icons/go";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

// const EditSearch = ({ setIsPlanning, setMenuOpen }) => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAll, setShowAll] = useState(false); // Toggle to show all plans

//   const fetchPlans = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/api/plan`);
//       setPlans(response.data.plan);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   return (
//     <div
//       id="main"
//       className="px-[30px] md:px-[50px] dark:text-white text-gray-300 dark:bg-[#3D3D3D] bg-[#1F2937] border-[1px] border-gray-700 py-[30px] w-full  rounded-[10px] lg:px-[50px] overflow-hidden hover:border-purple-500"
//     >
//       <div className="flex items-center gap-[10px] mb-[15px]">
//         <MdStarBorder className="text-2xl text-purple-500" />
//         <p className="font-Montserrat text-[16px] font-[500]">
//           Market Research planning
//         </p>
//       </div>

//       {loading ? (
//         // Skeleton Loader
//         Array.from({ length: 6 }).map((_, index) => (
//           <div
//             key={index}
//             className="flex justify-between items-center w-[610px] border-b dark:border-white border-[#34006133] pb-[11px]"
//           >
//             <div className="flex items-end gap-[12px]">
//               <div className="w-8 h-8 bg-[#d1d1d1] rounded-full animate-pulse"></div>
//               <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
//             </div>
//             <div className="w-24 h-4 bg-[#d1d1d1] rounded animate-pulse"></div>
//           </div>
//         ))
//       ) : (
//         <div
//           className={`transition-all duration-300 overflow-hidden ${
//             showAll && "h-[300px]" // Show 4 plans initially (approx. 300px height)
//           }`}
//           style={{
//             maxHeight: "400px",
//             overflowY: showAll ? "auto" : "hidden",
//           }}
//         >
//           {plans.map((plan, index) => (
//             <div
//               key={index}
//               className="flex gap-[25px] items-center w-[610px] border-b dark:border-white border-gray-700 hover:border-purple-500 pb-[11px]"
//             >
//               <div className="flex items-center gap-[12px]">
//                 <GoDotFill
//                   className="text-2xl dark:text-white text-[#A854F7] flex align-center"
//                   style={{
//                     height: "16px",
//                     width: "16px",
//                     display: "block",
//                     margin: "0 auto",
//                     // padding: "10px 0",
//                   }}
//                 />
//                 <h1
//                   className="font-Montserrat text-[13px] text-gray-300 font-[400] h-[30px] py-[10px] flex align-center"
//                   style={{
//                     maxWidth: "500px",
//                     overflow: "hidden",
//                     whiteSpace: "nowrap",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {plan}
//                 </h1>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {!loading && plans?.length > 4 && (
//         <button
//           className="text-white mt-4 py-1 px-2 rounded-md"
//           style={{
//             backgroundColor: "#A854F7",
//             fontSize: "12px",
//             fontFamily: "Montserrat, sans-serif",
//             fontWeight: "500",
//           }}
//           onClick={() => setShowAll(!showAll)}
//         >
//           {showAll ? "Show More" : "Show Less"}
//         </button>
//       )}

//       <p className="font-Montserrat text-[14px] font-normal pt-[20px]">
//         Estimated completion time: 5 minutes
//       </p>

//       <div className="flex-col flex md:flex-row mt-[35px] gap-[20px] sm:mt-[25px]">
//         <button className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]">
//           Edit Plan
//         </button>
//         <button
//           className="text-[#FFFFFF] dark:bg-[#3b82f5] bg-purple-500 hover:bg-purple-600 font-Montserrat font-semibold text-[12px] py-[09px] px-[20px] rounded-[8px]"
//           onClick={() => {
//             setIsPlanning(true);
//             setMenuOpen(false);
//           }}
//         >
//           Show Keyword Report
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EditSearch;
