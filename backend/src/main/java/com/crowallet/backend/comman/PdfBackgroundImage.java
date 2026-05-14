package com.crowallet.backend.comman;

import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfGState;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;

public class PdfBackgroundImage extends PdfPageEventHelper {

    private Image backgroundImage;

    public PdfBackgroundImage(String backgroundImagePath){
        try {
            this.backgroundImage = Image.getInstance(backgroundImagePath);
        } catch (Exception e) {
            System.out.println("Arka Plana Resim Yüklenirken Hata Oluştu");            
            e.printStackTrace();
        }
    }

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        try {
            if (backgroundImage != null){
                float width = document.getPageSize().getWidth();
                float height = document.getPageSize().getHeight();

                backgroundImage.setAbsolutePosition(0, 0);
                backgroundImage.scaleAbsolute(width, height / 10);

                PdfGState gState = new PdfGState();
                
                gState.setFillOpacity(0.20f); 
                gState.setStrokeOpacity(0.20f);

                writer.getDirectContentUnder().saveState();
                writer.getDirectContentUnder().setGState(gState);

                writer.getDirectContentUnder().addImage(backgroundImage);
                writer.getDirectContentUnder().restoreState();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
