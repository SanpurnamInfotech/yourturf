import {
    FaParking,
    FaLightbulb,
    FaTint,
  } from "react-icons/fa";
  
  function Facilities() {
    const facilities = [
      {
        title: "Flood Lights",
        icon: <FaLightbulb size={45} />,
        description:
          "Play day and night with powerful flood lighting.",
      },
      {
        title: "Parking",
        icon: <FaParking size={45} />,
        description:
          "Spacious parking area for players and visitors.",
      },
      {
        title: "Washroom",
        icon: "🚻",
        description:
          "Clean and well-maintained washroom facilities.",
      },
      {
        title: "Drinking Water",
        icon: <FaTint size={45} />,
        description:
          "Fresh drinking water available for all players.",
      },
    ];
  
    return (
      <section
        className="py-20 bg-gray-50"
        id="facilities"
      >
        <div className="max-w-7xl mx-auto px-6">
  
          {/* Section Heading */}
          <div className="text-center mb-14">
  
            <span className="text-green-600 font-semibold uppercase tracking-wider">
              Our Facilities
            </span>
  
            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              Everything You Need
            </h2>
  
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Enjoy a premium sports experience with
              world-class facilities designed for
              comfort, convenience, and performance.
            </p>
  
          </div>
  
          {/* Cards */}
          <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-8
          "
          >
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="
                  bg-white
                  rounded-2xl
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                  duration-300
                  p-8
                  text-center
                  hover:-translate-y-2
                "
              >
  
                <div
                  className="
                  w-20
                  h-20
                  mx-auto
                  rounded-full
                  bg-green-100
                  flex
                  items-center
                  justify-center
                  text-green-600
                  text-4xl
                "
                >
                  {facility.icon}
                </div>
  
                <h3
                  className="
                  text-xl
                  font-bold
                  mt-6
                  mb-3
                "
                >
                  {facility.title}
                </h3>
  
                <p className="text-gray-600">
                  {facility.description}
                </p>
  
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }
  
  export default Facilities;