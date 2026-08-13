import { useEffect, useState } from "react";
import API from "../services/api";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Gallery({ turf }) {

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {

    loadImages();

  }, []);

  const loadImages = async () => {

    try {

      const response = await API.get("gallery/");

      setImages(response.data);

    }

    catch (error) {

      console.log(error);

    }

    finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <section
        id="gallery"
        className="py-24 bg-gray-50"
      >

        <div className="text-center">

          <h2 className="text-2xl font-bold">

            Loading Gallery...

          </h2>

        </div>

      </section>

    );

  }

  return (

    <section
      id="gallery"
      className="py-24 bg-gradient-to-b from-gray-50 to-white"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-16">

          <span
            className="
            text-green-600
            uppercase
            tracking-[4px]
            font-bold
            "
          >

            {turf?.name || "Dream Turf"} Turf

          </span>

          <h2
            className="
            text-4xl
            md:text-5xl
            font-extrabold
            mt-4
            "
          >

            Explore Our Gallery

          </h2>

          <p
            className="
            text-gray-600
            mt-5
            max-w-3xl
            mx-auto
            text-lg
            "
          >

            Experience our premium cricket and football
            turf through real photos uploaded directly
            from the admin panel.

          </p>

        </div>
                {/* Gallery Slider */}

        <Swiper

          modules={[
            Autoplay,
            Navigation,
            Pagination,
          ]}

          loop={true}

          centeredSlides={true}

          spaceBetween={30}

          navigation={true}

          pagination={{
            clickable: true,
          }}

          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}

          breakpoints={{

            320: {

              slidesPerView: 1,

            },

            640: {

              slidesPerView: 2,

            },

            1024: {

              slidesPerView: 3,

            },

          }}

          className="pb-14"

        >

          {images.map((img) => (

            <SwiperSlide
              key={img.id}
            >

              <div

                onClick={() =>
                  setSelectedImage(
                    img.image
                  )
                }

                className="
                relative
                rounded-3xl
                overflow-hidden
                cursor-pointer
                group
                shadow-2xl
                "

              >

                <img

                  src={img.image}

                  alt={turf?.name || "Dream Turf"} Turf

                  className="
                  h-[450px]
                  w-full
                  object-cover
                  duration-700
                  transition-all
                  group-hover:scale-110
                  "

                />

                {/* Dark Overlay */}

                <div

                  className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/70
                  via-black/20
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-500
                  "

                />

                {/* Caption */}

                <div

                  className="
                  absolute
                  bottom-0
                  left-0
                  w-full
                  p-6
                  translate-y-10
                  group-hover:translate-y-0
                  transition-all
                  duration-500
                  "

                >

                  <h3

                    className="
                    text-white
                    text-2xl
                    font-bold
                    "

                  >

                    {turf?.name || "Dream Turf"} Turf

                  </h3>

                  <p

                    className="
                    text-gray-200
                    mt-2
                    "

                  >

                    Premium Cricket & Football Ground

                  </p>

                </div>

              </div>

            </SwiperSlide>

          ))}

        </Swiper>
                {/* Lightbox */}

        {selectedImage && (

          <div

            className="
            fixed
            inset-0
            bg-black/90
            flex
            items-center
            justify-center
            z-[999]
            p-5
            "

            onClick={() =>
              setSelectedImage(null)
            }

          >

            <button

              className="
              absolute
              top-5
              right-8
              text-white
              text-5xl
              font-bold
              hover:text-red-500
              transition
              "

              onClick={() =>
                setSelectedImage(null)
              }

            >

              ×

            </button>

            <img

              src={selectedImage}

              alt={turf?.name || "Dream Turf"} Turf

              className="
              max-w-[95%]
              max-h-[90vh]
              rounded-2xl
              shadow-2xl
              "

              onClick={(e) =>
                e.stopPropagation()
              }

            />

          </div>

        )}

      </div>

    </section>

  );

}

export default Gallery;