export default function PokemonBox({
  item
}: {
    item: {
      name: string,
      number: number,
      img: string,
      type: string[]
    }
  }) {
    const { name, img, number, type } = item;
  
    return (
      <div className="flex flex-col items-center justify-between">
        <span>{name}</span>
        <img
          src={img}
          alt={name}
          className="w-20"
          width={35}
          height={50}
        />
        <span>number:{number}</span>
      </div>
    );
  }
  