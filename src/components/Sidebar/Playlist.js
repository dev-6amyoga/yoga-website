import usePlaylistStore from "../../store/PlaylistStore";
import data from "../../data/asanas.json";
import useVideoStore from "../../store/VideoStore";
import { useState } from "react";
import { Drawer, Button } from "@geist-ui/core";
function Playlist() {
  const allAsanas = [];
  const asanaMap = {};
  for (var key in data) {
    allAsanas.push(key);
    asanaMap[key] = data[key].asana;
  }

  const queue = usePlaylistStore((state) => state.queue);
  const archive = usePlaylistStore((state) => state.archive);
  const addToQueue = usePlaylistStore((state) => state.addToQueue);
  const [state, setState] = useState(false);
  const [queueState, setQueueState] = useState(false);

  return (
    <div className="border border-red-500">
      <Button auto onClick={() => setState(true)} scale={1 / 2}>
        Show Drawer
      </Button>
      <Drawer visible={state} onClose={() => setState(false)} placement="right">
        <Drawer.Title>Drawer</Drawer.Title>
        <Drawer.Subtitle>This is a drawer</Drawer.Subtitle>
        <Drawer.Content>
          <div className="flex flex-col gap-2">
            {allAsanas.map((x) => (
              <Button
                key={asanaMap[x].name}
                type={
                  queue
                    ? queue.includes(x)
                      ? "success"
                      : "secondary"
                    : "secondary"
                }
                onClick={() => {
                  addToQueue(x);
                }}
              >
                {asanaMap[x].name}
              </Button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer>

      <Button auto onClick={() => setQueueState(true)} scale={1 / 2}>
        Show Queue
      </Button>
      <Drawer
        visible={queueState}
        onClose={() => setQueueState(false)}
        placement="right"
      >
        <Drawer.Title>Drawer</Drawer.Title>
        <Drawer.Subtitle>This is a drawer</Drawer.Subtitle>
        <Drawer.Content>
          <div className="flex flex-col gap-2">
            {queue.map((queue_item) => {
              return (
                <button key={queue_item}>{asanaMap[queue_item].name}</button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer>
    </div>

    //     <div className="">
    //         {allAsanas.map((x) => (
    //             <button
    //             key={asanaMap[x].name}
    //                 className="border border-green-500"
    //                 onClick={() => {
    //                     addToQueue(x);
    //                 }}>
    //                 {asanaMap[x].name}
    //             </button>
    //         ))}
    //     </div>
    //     {/* <div>{first ? asanaMap[first].name : ""}</div> */}
    //     <div>
    //         <p>Queue : </p>
    //         <div>
    //             {queue.map((queue_item) => {
    //                 return <button key={queue_item}>{asanaMap[queue_item].name}</button>;
    //             })}
    //         </div>
    //     </div>
    //     <div>
    //         <p>Archive : </p>
    //         <div>
    //             {archive?.map((archive_item) => {
    //                 return <button key={archive_item}>{asanaMap[archive_item].name}</button>;
    //             })}
    //         </div>
    //     </div>
    // </div>
  );
}

export default Playlist;
