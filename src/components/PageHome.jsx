import './PageHome.scss';

const PageHome = () => {
  return (
    <div className="page-home">
      <h3>Abstract</h3>
      <div className="abstract-body">
        Grounded image generation enables precise spatial control over pretrained diffusion models, making it possible to use chart images as visual guides during the image generation process. This paper presents a novel approach that generates cohesive and natural illustrations of vertical bar charts by integrating real-world object images as visual embellishments. The proposed pipeline takes an object image and a reference bar chart as input and produces an embellished bar chart that follows the structure of the input chart. To preserve chart integrity by maintaining the count, position, size, and order of data values, we introduce a strategy that anchors top and bottom parts of object image to the top and bottom of each bar while allowing the middle section to be filled by the generation model. We demonstrate the efficacy of the pipeline through the generation of 4,725 chart images followed by filtering and evaluation based on three integrity metrics. The results show that generation success rate is affected by various factors. We also address limitations of the evaluation using detection, trade-offs in end-to-end image generation and outline future work direction for broader chart type coverage.
      </div>
      {/* horizontal line */}
      <hr />
      <h3>Pipeline</h3>
      <img src={"/pipeline-3.png"} alt="pipeline" />
      <div className="abstract-body">
        <b>Pipeline Description:</b> From (A) an object image having top / middle / bottom parts, it can generate (B) three types of Canny edges (default / blur / sparsify). By arranging the edges for (E) the original bar chart, it can generate (C) small-to-large scale images for controlling the model. Lastly, (F) the ControlNet model can generate embellished bar charts with a degree of conditioning scales.
      </div>
      <hr />
    </div>
  );
};

export default PageHome;
