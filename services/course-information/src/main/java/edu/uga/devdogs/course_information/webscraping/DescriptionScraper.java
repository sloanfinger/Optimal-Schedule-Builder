package edu.uga.devdogs.course_information.webscraping;

// Removed incorrect import for jakarta.xml.bind.Element

import java.time.Duration;
import java.util.NoSuchElementException;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class DescriptionScraper {

  private final WebDriver driver;
  private final WebDriverWait wait;

  public DescriptionScraper(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(12));
  }

  public String getCourseDescription(String coursePrefix, String courseSuffix) {
    try {
      driver.get("https://bulletin.uga.edu/Course/Index");

      WebElement prefixEntry = driver.findElement(By.id("courseSubjectNav"));
      WebElement suffixEntry = driver.findElement(By.id("courseNumberNav"));
      WebElement btn = driver.findElement(By.id("btnSearchPrefixCourseNav"));

      prefixEntry.sendKeys(coursePrefix);
      suffixEntry.sendKeys(courseSuffix);

      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);

      wait.until(
          ExpectedConditions.presenceOfElementLocated(
              By.id("paginationContent")));

      return driver.findElement(By.cssSelector("#paginationContent > .course-card > .course-card--bottom > p"))
          .getText().trim();
    } catch (NoSuchElementException e) {
      return "Description not found";
    } catch (Exception e) {
      System.err.println(
          "Error fetching course description (" +
              coursePrefix +
              " " +
              courseSuffix +
              "): " +
              e.getMessage());
      return "Error retrieving description";
    }
  }
}
