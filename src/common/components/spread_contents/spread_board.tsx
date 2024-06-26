import "./styles/spread_board.css";
import useSpreadBoard from "./hooks/useSpreadBoard";
import RestartBtn from "./components/restart_btn";
import SpreadItem from "./components/spread_Item";

export default function SpreadBoard() {
  const { spreadBoardRef } = useSpreadBoard();

  return (
    <div className="spread-board-container">
      <div ref={spreadBoardRef} className="spread-board">
        <div className="spread-board__center"></div>
        {[...Array(6)].map((__, index) => (
          <SpreadItem key={index} imageUrl={`/images/content_${index}.png`} />
        ))}
        <div>
          <RestartBtn />
        </div>
      </div>
    </div>
  );
}
