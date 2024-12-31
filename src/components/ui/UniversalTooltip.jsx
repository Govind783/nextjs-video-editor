import React, { memo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const UniversalTooltip = memo(({ trigger, content }) => {
  return (
    <div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>{trigger}</TooltipTrigger>
          <TooltipContent>{content}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

export default UniversalTooltip;
UniversalTooltip.displayName = "UniversalTooltip";
