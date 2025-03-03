export default function LearnAyurveda() {
    const content = [
       {
          id: 1,
          title: "🌿 Introduction to Ayurveda",
          description:
             "Ayurveda is an ancient Indian system of medicine that promotes natural healing. It focuses on balance between body, mind, and spirit.",
          image: "/images/ayurveda_intro.jpg",
       },
       {
          id: 2,
          title: "🍵 Health Benefits of Herbal Medicine",
          description:
             "Herbal medicines like Tulsi, Ashwagandha, and Turmeric have numerous health benefits, including boosting immunity and reducing stress.",
          image: "/images/herbal_medicine.jpg",
       },
       {
          id: 3,
          title: "🕉️ Importance of Pooja Rituals",
          description:
             "Pooja rituals create a positive environment and promote mental well-being. They are an integral part of Indian spiritual practices.",
          image: "/images/pooja_rituals.jpg",
       },
    ];
 
    return (
       <div className="my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {content.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-white shadow-lg">
                   <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-md" />
                   <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                   <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
             ))}
          </div>
       </div>
    );
 }
 